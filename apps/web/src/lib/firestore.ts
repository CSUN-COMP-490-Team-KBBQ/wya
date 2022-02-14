import {
  doc,
  getFirestore,
  getDoc,
  DocumentData,
  DocumentReference,
  onSnapshot,
  DocumentSnapshot,
  FirestoreError,
  Unsubscribe,
  updateDoc,
} from 'firebase/firestore';
import axios from 'axios';
import app from './firebase';
import EventData, { EventDataAvailability } from '../interfaces/EventData';
import UserData from '../interfaces/User';

const firestore = getFirestore(app);

function getDocRef(path: string): DocumentReference<DocumentData> {
  return doc(firestore, path);
}

export const createEvent = (eventData: EventData): Promise<string> => {
  return new Promise((resolve, reject) => {
    // rather than handling this on the client side we will POST the form data to the cloud function api
    axios
      .post(
        'https://us-central1-kbbq-wya-35414.cloudfunctions.net/api/create-event',
        JSON.stringify(eventData),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      .then((res) => {
        // eslint-disable-next-line
        console.log(res.data);
        resolve(eventData.eventId);
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

export const updateUserRecord = async (user: UserData): Promise<void> => {
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

export const updateCalendarAvailability = (data: number[], uid: string) => {
  const userHeatMapAvailabilityDocRef = getDocRef(
    `/${process.env.REACT_APP_USERS}/${uid}/${process.env.REACT_APP_USER_HEAT_MAP_AVAILABILITY}`
  );

  return updateDoc(userHeatMapAvailabilityDocRef, {
    data,
  });
};

export const updateUserTimeFormatOption = (
  timeFormatOption: boolean,
  uid: string
): Promise<void> => {
  const userDocRef = getDocRef(`/users/${uid}`);
  return updateDoc(userDocRef, 'timeFormat24Hr', timeFormatOption);
};

export const updateEventAvailability = (
  data: EventDataAvailability,
  eventId: string
): Promise<void> => {
  const eventDocRef = getDocRef(`/events/${eventId}`);
  return updateDoc(eventDocRef, 'availability', data);
};

export default firestore;
