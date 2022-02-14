import assert from 'assert';
import Debug from 'debug';
import firebaseAdmin from 'firebase-admin';

import { EventPlanDocument } from './@typings';

const debug = Debug('wya-api:etl/firebase/delete-event-plan');

type EtlFirebaseDeleteEventPlanParams = {
  eventPlanId: EventPlanDocument['eventPlanId'];
};

type EtlFirebaseDeleteEventPlanContext = {
  firebase: firebaseAdmin.app.App;
};

export const etlFirebaseDeleteEventPlan = async (
  params: EtlFirebaseDeleteEventPlanParams,
  context: EtlFirebaseDeleteEventPlanContext
) => {
  const { eventPlanId } = params;

  assert(eventPlanId);

  debug(`Deleting event plan: ${eventPlanId}`);

  try {
    const { firebase } = context;
    const firebaseFirestore = firebase.firestore();

    await firebaseFirestore.runTransaction(async (transaction) => {
      /** Extract */
      const eventPlanDocRef = firebaseFirestore.doc(
        `/${process.env.EVENT_PLANS}/${eventPlanId}`
      );
      const eventPlanDoc = await eventPlanDocRef.get();
      const eventPlanDocData = eventPlanDoc.data() as
        | EventPlanDocument
        | undefined;

      const invitees = eventPlanDocData?.invitees ?? [];

      /** Transform */
      /** Load */

      // Delete the event plan for all invitees
      await Promise.all(
        invitees.map((userId) => {
          const inviteeEventPlanDocRef = firebaseFirestore.doc(
            `/${process.env.USERS}/${userId}/${process.env.USER_EVENT_PLANS}/${eventPlanId}`
          );
          return transaction.delete(inviteeEventPlanDocRef);
        })
      );

      // Delete the event plan doc recursively
      await firebaseFirestore.recursiveDelete(eventPlanDocRef);
    });
  } catch (err: any) {
    throw {
      errors: [
        {
          status: 500,
          code: `etlFirebaseDeleteEventPlan:${err?.errorInfo?.code}`,
          message: err?.errorInfo?.message,
        },
      ],
    };
  }
};
