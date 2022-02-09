import EventData from '../interfaces/EventData';
import { formatAvailability } from '../lib/availability';

export class PrepForFirestore {
    static convertUserAvailabilityData(userAvailabilityData: Date[]): number[] {
        return userAvailabilityData.map((value) => value.getTime());
    }

    static convertFormValues(eventData: EventData): EventData {
        const availability = formatAvailability(
            eventData.startDate,
            eventData.endDate,
            eventData.startTime,
            eventData.endTime
        );

        return { ...eventData, availability };
    }
}
