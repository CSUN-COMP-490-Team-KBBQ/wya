import assert from 'assert';
import Debug from 'debug';
import firebaseAdmin from 'firebase-admin';
import nodemailer from 'nodemailer';
import { v4 as uuid } from 'uuid';

import {
  EventDocument,
  EventInfo,
  EventGuest,
  UserEventDocument,
} from '../../../interfaces';

const debug = Debug('wya-api:etl/firebase/create-new-event-finalized');

type EtlFirebaseCreateNewEventFinalizedParams = EventInfo & {
  guests: EventGuest[];
};

type EtlFirebaseCreateNewEventFinalizedContext = {
  firebase: firebaseAdmin.app.App;
};

const _validateParams = (params: EtlFirebaseCreateNewEventFinalizedParams) => {
  const { guests, ...restOfParams } = params;
  for (const [key, value] of Object.entries(restOfParams)) {
    assert(value || value === '', `[${key}] is required`);
  }

  // If there are invitees check to make sure we have proper emails
  if (guests.length) {
    /**
     * Regex copied from : https://stackoverflow.com/questions/201323/how-can-i-validate-an-email-address-using-a-regular-expression
     */
    const EMAIL_REGEX =
      /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
    guests.forEach((guest) => {
      assert(EMAIL_REGEX.test(guest.email), 'Invalid email provided');
    });
  }
};

export const etlFirebaseCreateNewEventPlan = async (
  params: EtlFirebaseCreateNewEventFinalizedParams,
  context: EtlFirebaseCreateNewEventFinalizedContext
) => {
  // Should validate these params
  _validateParams(params);

  try {
    const { firebase } = context;
    const firebaseFirestore = firebase.firestore();

    /** Extract */
    const eventFinalizedId = uuid();
    const { guests, hostId, ...restOfParams } = params;

    /** Transform */

    // // Map and reduce the array of invitees' emails into an array of invitees' userIds
    // const guestsByUserIds: UserId[] = await (
    //   await Promise.all(
    //     guests.map((guest) => {
    //       etlFirebaseGetUserByEmail({ email: guest.email }, { firebase });
    //     })
    //   )
    // ).reduce((acc: UserId[], { data: [userId] }) => {
    //   return [...acc, userId];
    // }, []);

    /** Load */
    await firebaseFirestore.runTransaction(async (transaction) => {
      // Create the event doc
      const eventFinalizedRef = firebaseFirestore.doc(
        `/${process.env.EVENTS}/${eventFinalizedId}`
      );
      await transaction.create(eventFinalizedRef, {
        ...restOfParams,
        // Re adding back hostId because it was destructed earlier
        hostId,
        eventId: eventFinalizedId,
      } as EventDocument);

      // Create the events/guests/userId for each invitee
      const guestsAndHostByUserId = [hostId];
      guests.forEach((guest) => guestsAndHostByUserId.push(guest.uid));
      await Promise.all(
        guestsAndHostByUserId.map((userId) => {
          const eventFinalizedGuestsRef = firebaseFirestore.doc(
            `/${process.env.EVENTS}/${eventFinalizedId}/${process.env.EVENT_GUESTS}/${userId}`
          );
          return transaction.create(eventFinalizedGuestsRef, {
            status: 'PENDING',
          });
        })
      );

      // Associate event doc to host
      const hostEventFinalizedDocRef = firebaseFirestore.doc(
        `/${process.env.USERS}/${hostId}/${process.env.USER_EVENTS}/${eventFinalizedId}`
      );
      await transaction.create(hostEventFinalizedDocRef, {
        ...restOfParams,
        role: 'HOST',
      } as UserEventDocument);

      // Associate event doc to each invitee
      await Promise.all(
        guests.map((guest) => {
          const inviteeEventPlanDocRef = firebaseFirestore.doc(
            `/${process.env.USERS}/${guest.uid}/${process.env.USER_EVENTS}/${eventFinalizedId}`
          );
          return transaction.create(inviteeEventPlanDocRef, {
            ...restOfParams,
            role: 'GUEST',
          } as UserEventDocument);
        })
      );
    });

    // Send emails to invitees
    try {
      const emailTransport = nodemailer.createTransport({
        // NOTE: Using gmail as a sender because there is currently no domain for an email service
        service: 'gmail',
        auth: {
          user: process.env.NODEMAILER_USERNAME,
          pass: process.env.NODEMAILER_PASSWORD,
        },
      });

      guests.forEach((guest) => {
        if (guest.email) {
          debug(`Sending invitation email to ${guest.email}`);
          const [domain] = (
            process.env.DOMAINS ?? 'http://localhost:3000'
          ).split(',');
          const eventFinalizedUrl = `${domain}/events-finalized/${eventFinalizedId}`;
          const { name } = restOfParams;
          const mailOptions = {
            from: process.env.NODEMAILER_USERNAME,
            to: guest.email,
            subject: `WYA?! An event has been finalized!`,
            html:
              '<h1>WYA</h1>' +
              `<p>The event finalized is :${name}</p>` +
              `<p>Click here to view event: <a href="${eventFinalizedUrl}">${eventFinalizedUrl}</a></p>`,
          };

          emailTransport.sendMail(mailOptions, (err, info) => {
            if (err) {
              debug(`Error sending email to ${guest.email}`);
              debug(`${JSON.stringify(err ?? {}, null, 2)}`);
            } else {
              debug(`Send to ${guest.email}`);
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
