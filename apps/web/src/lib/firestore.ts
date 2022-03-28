import axios from 'axios';
import {
  doc,
  getFirestore,
  getDoc,
  DocumentData,
  onSnapshot,
  DocumentSnapshot,
  FirestoreError,
  Unsubscribe,
  updateDoc,
  collection,
  QuerySnapshot,
} from 'firebase/firestore';
import { EventPlanInfo, EventInfo, UserDocument } from 'wya-api/src/interfaces';

import app from './firebase';
import EventData, { EventDataAvailability } from '../interfaces/EventData';

type Email = string;
type UserId = string;

const firestore = getFirestore(app);

function getDocRef(path: string) {
  return doc(firestore, path);
}

function getCollRef(path: string) {
  return collection(firestore, path);
}

export const createEventPlan = (
  data: EventPlanInfo & {
    invitees: Email[];
    'g-recaptcha-response': string;
  }
) => {
  return new Promise((resolve, reject) => {
    axios
      .post(
        `${process.env.REACT_APP_FIREBASE_CLOUD_FUNCTIONS_URL}/api/event-plans/create`,
        JSON.stringify(data),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      .then((res) => {
        console.log(res);
        const {
          data: {
            data: [eventPlanId],
          },
        } = res;
        resolve(eventPlanId);
      })
      .catch(reject);
  });
};

export const createEventFinalized = (
  data: EventInfo & {
    invitees: UserId[];
  }
) => {
  return new Promise((resolve, reject) => {
    axios
      .post(
        `${process.env.REACT_APP_FIREBASE_CLOUD_FUNCTIONS_URL}/api/events/create`,
        JSON.stringify(data),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      .then((res) => {
        console.log(res);
        const {
          data: {
            data: [eventFinalizedId],
          },
        } = res;
        resolve(eventFinalizedId);
      })
      .catch(reject);
  });
};

export const getEventData = async (eventId: string): Promise<EventData> => {
  const eventDocRef = getDocRef(`/events/${eventId}`);
  return (await getDoc(eventDocRef)).data() as EventData;
};

export const updateEvent = async (event: EventData): Promise<void> => {
  const eventDocRef = getDocRef(`/events/${event.eventId}`);
  return updateDoc(eventDocRef, { ...event });
};

export const updateUserDocument = async (userDocument: UserDocument) => {
  const userDocRef = getDocRef(`/users/${userDocument.uid}`);
  return updateDoc(userDocRef, { ...userDocument });
};

export const updateUserRecord = async (user: UserDocument): Promise<void> => {
  const userDocRef = getDocRef(`/users/${user.uid}`);
  return updateDoc(userDocRef, { ...user });
};

export const getDocSnapshot$ = (
  path: string,
  observer: {
    next?: ((snapshot: DocumentSnapshot<DocumentData>) => void) | undefined;
    error?: ((error: FirestoreError) => void) | undefined;
    complete?: (() => void) | undefined;
  }
): Unsubscribe => {
  const docRef = getDocRef(path);
  return onSnapshot(docRef, observer);
};
export const getSubCollDocSnapshot$ = (
  path: string,
  observer: {
    next?: ((snapshot: DocumentSnapshot<DocumentData>) => void) | undefined;
    error?: ((error: FirestoreError) => void) | undefined;
    complete?: (() => void) | undefined;
  }
): Unsubscribe => {
  const subCollDocRef = getDocRef(path);
  return onSnapshot(subCollDocRef, observer);
};

export const getAllSubCollDocsSnapshot$ = (
  path: string,
  observer: {
    next?: ((snapshot: QuerySnapshot<DocumentData>) => void) | undefined;
    error?: ((error: FirestoreError) => void) | undefined;
    complete?: (() => void) | undefined;
  }
): Unsubscribe => {
  const subCollRef = getCollRef(path);
  return onSnapshot(subCollRef, observer);
};

export const updateCalendarAvailability = (data: number[], uid: string) => {
  const userHeatMapAvailabilityDocRef = getDocRef(
    `/${process.env.REACT_APP_USERS}/${uid}/${process.env.REACT_APP_USER_SCHEDULE_SELECTOR_AVAILABILITY}/`
  );

  return updateDoc(userHeatMapAvailabilityDocRef, {
    data,
  });
};

export const updateUserTimeFormat = (uid: UserId, timeFormat: string) => {
  const userDocRef = getDocRef(`/users/${uid}`);
  return updateDoc(userDocRef, { timeFormat });
};

export const updateEventAvailability = (
  data: EventDataAvailability,
  eventPlanId: string,
  userId: string
): Promise<void> => {
  const eventPlanAvailabilityDocRef = getDocRef(
    `/${process.env.REACT_APP_EVENT_PLANS}/${eventPlanId}/${process.env.REACT_APP_EVENT_PLAN_AVAILABILITIES}/${userId}`
  );
  return updateDoc(eventPlanAvailabilityDocRef, {
    data,
  });
};

export default firestore;
