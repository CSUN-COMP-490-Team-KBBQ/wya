import assert from 'assert';
import Debug from 'debug';
import firebaseAdmin from 'firebase-admin';

import { EventPlanDocument } from '../../../interfaces';

const debug = Debug('wya-api:etl/firebase/delete-event-plan');

type EtlFirebaseDeleteEventPlanParams = {
  eventPlanId: EventPlanDocument['eventPlanId'];
};

type EtlFirebaseDeleteEventPlanContext = {
  firebaseClientInjection: firebaseAdmin.app.App;
};

export const etlFirebaseDeleteEventPlan = async (
  params: EtlFirebaseDeleteEventPlanParams,
  context: EtlFirebaseDeleteEventPlanContext
) => {
  const { eventPlanId } = params;

  assert(eventPlanId);

  debug(`Deleting event plan: ${eventPlanId}`);

  try {
    const { firebaseClientInjection } = context;
    const firebaseFirestore = firebaseClientInjection.firestore();

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
      const hostId = eventPlanDocData?.hostId;

      /** Transform */
      /** Load */
      // Delete the event plan for host
      const hostEventPlanDocRef = firebaseFirestore.doc(
        `/${process.env.USERS}/${hostId}/${process.env.USER_EVENT_PLANS}/${eventPlanId}`
      );
      await transaction.delete(hostEventPlanDocRef);

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
