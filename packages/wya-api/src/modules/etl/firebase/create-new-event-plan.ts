import assert from 'assert';
import Debug from 'debug';
import firebaseAdmin from 'firebase-admin';
import nodemailer from 'nodemailer';
import { v4 as uuid } from 'uuid';

import { UserId, Email, EventPlanDocument, EventPlanInfo } from './@typings';
import { etlFirebaseGetUserByEmail } from './get-user-by-email';

const debug = Debug('wya-api:etl/firebase/create-new-event-plan');

type EtlFirebaseCreateNewEventPlanParams = EventPlanInfo & {
  invitees: Email[];
};

type EtlFirebaseCreateNewEventPlanContext = {
  firebase: firebaseAdmin.app.App;
};

const _validateParams = (params: EtlFirebaseCreateNewEventPlanParams) => {
  const { invitees, ...restOfParams } = params;
  for (const [key, value] of Object.entries(restOfParams)) {
    assert(value, `[${key}] is required`);
  }

  // If there are invitees check to make sure we have proper emails
  if (invitees.length) {
    /**
     * Regex copied from : https://stackoverflow.com/questions/201323/how-can-i-validate-an-email-address-using-a-regular-expression
     */
    const EMAIL_REGEX =
      /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
    for (const email of invitees) {
      assert(EMAIL_REGEX.test(email), 'Invalid email provided');
    }
  }
};

export const etlFirebaseCreateNewEventPlan = async (
  params: EtlFirebaseCreateNewEventPlanParams,
  context: EtlFirebaseCreateNewEventPlanContext
) => {
  // Should validate these params
  _validateParams(params);

  try {
    const { firebase } = context;
    const firebaseFirestore = firebase.firestore();

    /** Extract */
    const eventPlanId = uuid();
    const { invitees: inviteesByEmails, name, ...restOfParams } = params;

    /** Transform */

    // Map and reduce the array of invitees' emails into an array of invitees' userIds
    const inviteesByUserIds: UserId[] = await (
      await Promise.all(
        inviteesByEmails.map((email) =>
          etlFirebaseGetUserByEmail({ email }, { firebase })
        )
      )
    ).reduce((acc: UserId[], { data: [userId] }) => {
      return [...acc, userId];
    }, []);

    /** Load */
    await firebaseFirestore.runTransaction(async (transaction) => {
      // Create the event-plan doc
      const eventPlanRef = firebaseFirestore.doc(
        `/${process.env.EVENT_PLANS}/${eventPlanId}`
      );
      await transaction.create(eventPlanRef, {
        ...restOfParams,
        // Readd name here -- was destructed earlier because its to be used
        // when sending emails to invitees
        name,
        invitees: inviteesByUserIds,
        eventPlanId,
      } as EventPlanDocument);

      // Create the event-plan/availabilites/heat-map
      const eventPlanAvailabilitiesHeatMapRef = firebaseFirestore.doc(
        `/${process.env.EVENT_PLANS}/${eventPlanId}/${process.env.EVENT_PLAN_AVAILABILITIES}/${process.env.EVENT_PLAN_HEAT_MAP_AVAILABILITY}`
      );
      await transaction.create(eventPlanAvailabilitiesHeatMapRef, {
        // TODO: Heat-map availability should be extracted
        data: [],
      });

      // Create the event-plan/availabilites doc for each invitee
      await Promise.all(
        inviteesByUserIds.map((userId) => {
          const eventPlanInviteeAvailabilityRef = firebaseFirestore.doc(
            `/${process.env.EVENT_PLANS}/${eventPlanId}/${process.env.EVENT_PLAN_AVAILABILITIES}/${userId}`
          );
          return transaction.create(eventPlanInviteeAvailabilityRef, {
            // TODO: Invitees' availabilities should be extracted
            data: [],
          });
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

      inviteesByEmails.forEach((email) => {
        if (email) {
          debug(`Sending invitation email to ${email}`);
          const [domain] = (
            process.env.DOMAINS ?? 'http://localhost:3000'
          ).split(',');
          const eventPlanUrl = `${domain}/event-plans/${eventPlanId}`;
          const mailOptions = {
            from: process.env.NODEMAILER_USERNAME,
            to: email,
            subject: `WYA?! You've been invited to an event!`,
            html:
              '<h1>WYA</h1>' +
              `<p>You've been invited to :${name}</p>` +
              `<p>Click here to view event: <a href="${eventPlanUrl}">${eventPlanUrl}</a></p>`,
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

    debug(`Event plan created: ${eventPlanId}`);

    return {
      data: [eventPlanId],
    };
  } catch (err: any) {
    throw {
      errors: [
        {
          status: 500,
          code: `etlFirebaseCreateNewEventPlan:${err?.errorInfo?.code}`,
          message: err?.errorInfo?.message,
        },
      ],
    };
  }
};