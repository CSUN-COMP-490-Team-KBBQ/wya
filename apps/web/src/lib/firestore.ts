import axios from 'axios';
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
import {
  Email,
  EventPlanInfo,
  EventInfo,
  UserId,
  EventGuest,
} from 'wya-api/dist/interfaces';
// import { TimeFormat } from 'wya-api/dist/lib';
import app from './firebase';
import EventData, { EventDataAvailability } from '../interfaces/EventData';
import UserData from '../interfaces/User';

/** RO3: copied from wya-api/lib/time-format */
enum TimeFormat {
  TWELVE_HOURS = 'hh:mm a',
  TWENTY_FOUR_HOURS = 'HH:mm',
}
/** End of RO3 */

const firestore = getFirestore(app);

function getDocRef(path: string): DocumentReference<DocumentData> {
  return doc(firestore, path);
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
        `${process.env.REACT_APP_FIREBASE_CLOUD_FUNCTIONS_URL}/api/${process.env.REACT_APP_USER_EVENT_PLANS}/create`,
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
        `${process.env.REACT_APP_FIREBASE_CLOUD_FUNCTIONS_URL}/api/${process.env.REACT_APP_USER_EVENTS}/create`,
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
  const eventDocRef = getDocRef(`/${process.env.REACT_APP_EVENTS}/${eventId}`);
  return (await getDoc(eventDocRef)).data() as EventData;
};

export const updateEvent = async (event: EventData): Promise<void> => {
  const eventDocRef = getDocRef(
    `/${process.env.REACT_APP_EVENTS}/${event.eventId}`
  );
  return updateDoc(eventDocRef, { ...event });
};

export const updateUserRecord = async (user: UserData): Promise<void> => {
  const userDocRef = getDocRef(`/${process.env.REACT_APP_USERS}/${user.uid}`);
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
  const eventPlanAvailabilityDocRef = getDocRef(path);
  return onSnapshot(eventPlanAvailabilityDocRef, observer);
};

export const updateCalendarAvailability = (data: number[], uid: string) => {
  const userHeatMapAvailabilityDocRef = getDocRef(
    `/${process.env.REACT_APP_USERS}/${uid}/${process.env.REACT_APP_USER_SCHEDULE_SELECTOR_AVAILABILITY}/`
  );

  return updateDoc(userHeatMapAvailabilityDocRef, {
    data,
  });
};

export const updateUserTimeFormatOption = (
  timeFormatOption: boolean,
  uid: string
): Promise<void> => {
  const userDocRef = getDocRef(`/${process.env.REACT_APP_USERS}/${uid}`);
  return updateDoc(userDocRef, 'timeFormat24Hr', timeFormatOption);
};

export const updateUserRecordTimeFormat = (
  uid: UserId,
  timeFormat: TimeFormat
) => {
  const userRecordDocRef = getDocRef(`/${process.env.REACT_APP_USERS}/${uid}`);
  return updateDoc(userRecordDocRef, { timeFormat });
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
