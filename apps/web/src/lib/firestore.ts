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

export class PrepForFirestore {
    static convertUserAvailabilityData(userAvailabilityData: Date[]): number[] {
        return userAvailabilityData.map((value) => value.getTime());
    }
}

function getDocRef(path: string): DocumentReference<DocumentData> {
    return doc(firestore, path);
}

const formatAvailability = (
    startDate: string,
    endDate: string,
    startTime: string,
    endTime: string
): EventDataAvailability => {
    const ONEDAYTOMILLISEC = 86400000;
    const TIMEINCREMENT = new Date(900000);
    const startDateTimeStamp = new Date(`${startDate}T00:00`);
    const endDateTimeStamp = new Date(`${endDate}T23:59`);
    const startTimeTimeStamp = new Date(`1999-12-31T${startTime}`);
    const endTimeTimeStamp = new Date(
        new Date(`1999-12-31T${endTime}`).getTime() - TIMEINCREMENT.getTime()
    );
    let tempDateTimeStamp = startDateTimeStamp;
    let tempTimeTimeStamp = startTimeTimeStamp;
    const days = {};
    const AvailabilityHeatMap = {};

    // creating days map
    let i = 0;
    while (tempDateTimeStamp < endDateTimeStamp) {
        const tempDays = {
            [tempDateTimeStamp.valueOf().toString()]: [],
        };
        Object.assign(days, tempDays);
        tempDateTimeStamp = new Date(
            startDateTimeStamp.getTime() + i * ONEDAYTOMILLISEC
        );
        i += 1;
    }

    // creating availability map
    i = 0;
    while (tempTimeTimeStamp <= endTimeTimeStamp) {
        const tempAvailabilityHeatMap = {
            [tempTimeTimeStamp.toTimeString().slice(0, 5)]: days,
        };
        Object.assign(AvailabilityHeatMap, tempAvailabilityHeatMap);
        tempTimeTimeStamp = new Date(
            startTimeTimeStamp.getTime() + i * TIMEINCREMENT.getTime()
        );
        i += 1;
    }

    return AvailabilityHeatMap;
};

export const createEvent = (data: EventData): Promise<string> => {
    return new Promise((resolve, reject) => {
        const availability = formatAvailability(
            data.startDate,
            data.endDate,
            data.startTime,
            data.endTime
        );
        // rather than handling this on the client side we will POST the form data to the cloud function api
        axios
            .post(
                'https://us-central1-kbbq-wya-35414.cloudfunctions.net/api/create-event',
                JSON.stringify({ ...data, availability }),
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            )
            .then((res) => {
                // eslint-disable-next-line
                console.log(res.data);
                resolve(data.eventId);
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

export const updateCalendarAvailability = (
    date: Array<number>,
    uid: string
): Promise<string> => {
    // remove new Promise since updateDoc returns a promise
    return new Promise((resolve, reject) => {
        const userDocRef = getDocRef(`/users/${uid}`);

        updateDoc(userDocRef, 'availability', date)
            .then(() => {
                resolve(uid);
            })
            .catch(reject);
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
