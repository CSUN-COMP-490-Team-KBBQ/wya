export default interface UserData {
    uid: string;
    email: string;
    events: EventInfo[];
    firstName: string;
    lastName: string;
    availability: Array<number>;
    timeFormat24Hr: boolean;
}

export interface EventInfo {
    eventId: string;
    name: string;
    description: string;
    startDate: string;
    startTime: string;
    role: string;
    /**
     *  Fields for finalizing an event.
     *  Temp added here as part of the solution developed
     *  because of time contraints to MVP.
     */
    accepted: boolean;
    declined: boolean;
}
