import assert from 'assert';
import Debug from 'debug';
import firebaseAdmin from 'firebase-admin';
import fp from 'lodash/fp';
import { v4 as uuid } from 'uuid';

import { etlFirebaseGetUserByEmail } from './get-user-by-email';

const debug = Debug('wya-api:etl/firebase/create-new-event-plan');

type HourlyTimeFormat = 'hh' | 'HH';
type Email = string;
type UserId = string;

type EtlFirebaseCreateNewEventPlanParams = {
  /** RO3 copied from EventPlanData */
  name: string;
  description: string;
  dailyStartTime: string;
  dailyEndTime: string;
  startDate: string;
  endDate: string;
  hostId: string;
  hourlyTimeFormat: HourlyTimeFormat;
  /** End of R03 */

  invitees: Email[];
};

type EtlFirebaseCreateNewEventPlanContext = {
  firebase: firebaseAdmin.app.App;
};

type EventPlanData = {
  /** RO3 */
  name: string;
  description: string;
  dailyStartTime: string;
  dailyEndTime: string;
  startDate: string;
  endDate: string;
  hostId: string;
  hourlyTimeFormat: HourlyTimeFormat;
  /** End of R03 */

  invitees: UserId[];
  eventPlanId: string;
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
    const { invitees: inviteesByEmails, ...restOfParams } = params;

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
      const eventPlanRef = firebaseFirestore.doc(`/event-plans/${eventPlanId}`);
      await transaction.create(eventPlanRef, {
        ...restOfParams,
        invitees: inviteesByUserIds,
        eventPlanId,
      } as EventPlanData);

      // Create the event-plan/availabilites/heat-map
      const eventPlanAvailabilitiesHeatMapRef = firebaseFirestore.doc(
        `/event-plans/${eventPlanId}/availabilities/heat-map`
      );
      await transaction.create(eventPlanAvailabilitiesHeatMapRef, {
        // TODO: Heat-map availability should be extracted
        data: [],
      });

      // Create the event-plan/availabilites doc for each invitee
      await Promise.all(
        inviteesByUserIds.map((userId) => {
          const eventPlanInviteeAvailabilityRef = firebaseFirestore.doc(
            `/event-plans/${eventPlanId}/availabilities/${userId}`
          );
          return transaction.create(eventPlanInviteeAvailabilityRef, {
            // TODO: Invitees' availabilities should be extracted
            data: [],
          });
        })
      );
    });

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
