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

import app from './firebase';

import EventData from '../interfaces/EventData';
import {
  EventInfo,
  UserDocument,
  EventPlanAvailabilityDocument,
  EventPlanDocument,
  UserId,
  EventGuest,
  EventPlanId,
  EventId,
} from '../interfaces';

const firestore = getFirestore(app);

function getDocRef(path: string) {
  return doc(firestore, path);
}

function getCollRef(path: string) {
  return collection(firestore, path);
}

export const createEventFinalized = (
  data: EventInfo & { eventPlanId: EventPlanId } & {
    inviteesByUserId: UserId[];
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

export const deleteEventFinalized = (
  data: { eventId: EventId } & { hostId: UserId }
) => {
  return new Promise((resolve, reject) => {
    axios
      .post(
        `${process.env.REACT_APP_FIREBASE_CLOUD_FUNCTIONS_URL}/api/events/delete`,
        JSON.stringify(data),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      .then((res) => {
        console.log(res);
        resolve(res);
      })
      .catch(reject);
  });
};

export const updateEventGuests = (
  data: { eventId: EventId } & { hostId: UserId } & {
    eventGuests: EventGuest[];
  }
) => {
  return new Promise((resolve, reject) => {
    axios
      .post(
        `${process.env.REACT_APP_FIREBASE_CLOUD_FUNCTIONS_URL}/api/events/guests/update`,
        JSON.stringify(data),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      .then((res) => {
        console.log(res);
        resolve(res);
      })
      .catch(reject);
  });
};

export const deleteEventGuest = (
  data: { eventId: EventId } & { userId: UserId }
) => {
  return new Promise((resolve, reject) => {
    axios
      .post(
        `${process.env.REACT_APP_FIREBASE_CLOUD_FUNCTIONS_URL}/api/events/guests/delete`,
        JSON.stringify(data),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      .then((res) => {
        console.log(res);
        resolve(res);
      })
      .catch(reject);
  });
};

export const getEventData = async (
  eventId: string
): Promise<EventPlanDocument> => {
  const eventDocRef = getDocRef(`/events/${eventId}`);
  return (await getDoc(eventDocRef)).data() as EventPlanDocument;
};

export const updateEvent = async (event: EventData): Promise<void> => {
  const eventDocRef = getDocRef(`/events/${event.eventPlanId}`);
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
export const updateGuest = async (
  eventId: String,
  guest: EventGuest
): Promise<void> => {
  const eventDocRef = getDocRef(`/events/${eventId}/guests/${guest.uid}`);
  return updateDoc(eventDocRef, { ...guest });
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
    `/users/${uid}/availabilities/schedule-selector/`
  );

  return updateDoc(userHeatMapAvailabilityDocRef, {
    data,
  });
};

export const updateEventAvailability = (
  data: EventPlanAvailabilityDocument,
  eventPlanId: string,
  userId: string
): Promise<void> => {
  const eventPlanAvailabilityDocRef = getDocRef(
    `/event-plans/${eventPlanId}/availabilities/${userId}`
  );
  return updateDoc(eventPlanAvailabilityDocRef, { ...data });
};

export default firestore;
