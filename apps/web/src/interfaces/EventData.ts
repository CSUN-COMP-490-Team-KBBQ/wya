export default interface EventData {
    eventId: string;
    hostId: string;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    guests: string[];
    availability: EventDataAvailability;
    /**
     *  Fields for finalizing an event.
     *  Temp added here as part of the solution developed
     *  because of time contraints to MVP.
     */
    isFinalized: boolean;
    day: string;
    rsvp: string[];
}

export interface EventDataAvailability {
    [time: string]: {
        [date: string]: string[];
    };
}
