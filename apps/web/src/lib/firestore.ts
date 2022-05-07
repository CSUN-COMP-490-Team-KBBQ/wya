import {
  doc,
  getFirestore,
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

import { EventPlanAvailabilityDocument } from '../interfaces';

const firestore = getFirestore(app);

function getDocRef(path: string) {
  return doc(firestore, path);
}

function getCollRef(path: string) {
  return collection(firestore, path);
}

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
