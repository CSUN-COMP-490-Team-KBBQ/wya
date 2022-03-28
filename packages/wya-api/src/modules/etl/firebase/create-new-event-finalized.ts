import assert from 'assert';
import Debug from 'debug';
import { App } from 'firebase-admin/app';
import { getFirestore as getFirebaseFirestore } from 'firebase-admin/firestore';
import nodemailer from 'nodemailer';
import { v4 as uuid } from 'uuid';

import {
  EventDocument,
  EventInfo,
  UserEventDocument,
} from '../../../interfaces';
import { etlFirebaseGetEmailByUserId } from './get-email-by-userId';

const debug = Debug('wya-api:etl/firebase/create-new-event-finalized');

type UserId = string;
type Email = string;

type EtlFirebaseCreateNewEventFinalizedParams = EventInfo & {
  invitees: UserId[];
};

type EtlFirebaseCreateNewEventFinalizedContext = {
  firebaseClientInjection: App;
};

const _validateParams = (params: EtlFirebaseCreateNewEventFinalizedParams) => {
  const { invitees, ...restOfParams } = params;
  for (const [key, value] of Object.entries(restOfParams)) {
    assert(value || value === '', `[${key}] is required`);
  }

  // Do we need to validate at this point?

  // // If there are invitees check to make sure we have proper emails
  // if (invitees.length) {
  //   /**
  //    * Regex copied from : https://stackoverflow.com/questions/201323/how-can-i-validate-an-email-address-using-a-regular-expression
  //    */
  //   const EMAIL_REGEX =
  //     /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
  //   guests.forEach((guest) => {
  //     assert(EMAIL_REGEX.test(guest.email), 'Invalid email provided');
  //   });
  // }
};

export const etlFirebaseCreateNewEventFinalized = async (
  params: EtlFirebaseCreateNewEventFinalizedParams,
  context: EtlFirebaseCreateNewEventFinalizedContext
) => {
  // Should validate these params
  _validateParams(params);

  try {
    const { firebaseClientInjection } = context;
    const firebaseFirestore = getFirebaseFirestore(firebaseClientInjection);

    /** Extract */
    const eventFinalizedId = uuid();
    const { invitees: guestsByUserIds, hostId, ...restOfParams } = params;

    /** Transform */

    // Map and reduce the array of guests' userIds into an array of guests' emails
    const guestsByEmail = (await (
      await Promise.all(
        guestsByUserIds.map((userId) =>
          etlFirebaseGetEmailByUserId({ userId }, { firebaseClientInjection })
        )
      )
    )
      .reduce((acc: (Email | undefined)[], { data: [email] }) => {
        return [...acc, email];
      }, [])
      // Cheeky way to filter out falsey elements in array.
      .filter((email) => !!email)) as Email[];

    /** Load */
    await firebaseFirestore.runTransaction(async (transaction) => {
      // Create the event doc
      const eventFinalizedRef = firebaseFirestore.doc(
        `/events/${eventFinalizedId}`
      );
      await transaction.create(eventFinalizedRef, {
        ...restOfParams,
        // Re adding back hostId because it was destructed earlier
        hostId,
        eventId: eventFinalizedId,
      } as EventDocument);

      // Create the events/guests/email for each guest
      await Promise.all(
        guestsByEmail.map((email) => {
          const eventFinalizedGuestsRef = firebaseFirestore.doc(
            `/events/${eventFinalizedId}/guests/${email}`
          );
          return transaction.create(eventFinalizedGuestsRef, {
            status: 'PENDING',
          });
        })
      );

      // Associate event doc to host
      const hostEventFinalizedDocRef = firebaseFirestore.doc(
        `/users/${hostId}/events/${eventFinalizedId}`
      );
      await transaction.create(hostEventFinalizedDocRef, {
        ...restOfParams,
        role: 'HOST',
      } as UserEventDocument);

      // Associate event doc to each guest
      await Promise.all(
        guestsByUserIds.map((userId) => {
          const guestEventFinalizedDocRef = firebaseFirestore.doc(
            `/users/${userId}/events/${eventFinalizedId}`
          );
          return transaction.create(guestEventFinalizedDocRef, {
            ...restOfParams,
            role: 'GUEST',
          } as UserEventDocument);
        })
      );
    });

    // Send emails to guests
    try {
      const emailTransport = nodemailer.createTransport({
        // NOTE: Using gmail as a sender because there is currently no domain for an email service
        service: 'gmail',
        auth: {
          user: process.env.NODEMAILER_USERNAME,
          pass: process.env.NODEMAILER_PASSWORD,
        },
      });

      guestsByEmail.forEach((email) => {
        if (email) {
          debug(`Sending invitation email to ${email}`);
          const [domain] = (
            process.env.DOMAINS ?? 'http://localhost:3000'
          ).split(',');
          const eventFinalizedUrl = `${domain}/events-finalized/${eventFinalizedId}`;
          const { name } = restOfParams;
          const mailOptions = {
            from: process.env.NODEMAILER_USERNAME,
            to: email,
            subject: `WYA?! An event has been finalized!`,
            html:
              '<h1>WYA</h1>' +
              `<p>The event finalized is :${name}</p>` +
              `<p>Click here to view event: <a href="${eventFinalizedUrl}">${eventFinalizedUrl}</a></p>`,
          };

          emailTransport.sendMail(mailOptions, (err, info) => {
            if (err) {
              debug(`Error sending email to ${email}`);
              debug(`${JSON.stringify(err ?? {}, null, 2)}`);
            } else {
              debug(`Send to ${email}`);
              debug(`${JSON.stringify(info ?? {}, null, 2)}`);
            }
          });
        }
      });
    } catch (err) {
      /**
       * We fail silently for now so that the rest of this etl can complete
       */
    }

    debug(`Event finalized created: ${eventFinalizedId}`);

    return {
      data: [eventFinalizedId],
    };
  } catch (err: any) {
    throw {
      errors: [
        {
          status: 500,
          code: `etlFirebaseCreateNewEventFinalized:${err?.errorInfo?.code}`,
          message: err?.errorInfo?.message,
        },
      ],
    };
  }
};
