import moment from 'moment';
import EventData from '../interfaces/EventData';
import UserData from '../interfaces/User';

export const isUserAHost = (
    userRecord: UserData | null,
    id: string
): boolean => {
    if (!userRecord) return false;

    return userRecord.events.some((e) => e.eventId === id && e.role === 'HOST');
};

export const getFormValues = (
    formData: FormData,
    guests: string[]
): EventData => {
    let formValues = Object.fromEntries(
        formData.entries()
    ) as unknown as EventData;
    formValues.startTime = moment(formValues.startTime, ['hh:mm A']).format(
        'HH:mm'
    );
    formValues.endTime = moment(formValues.endTime, ['hh:mm A']).format(
        'HH:mm'
    );
    formValues = { ...formValues, guests };

    return formValues;
};

/** 
    add appropriate 15 minute increment to startTime
**/
export const startTimeFormatted = (timeString: string): number => {
    const minutesString = timeString.slice(3, 5);
    const hoursNum = Number(timeString.slice(0, 2));

    if (minutesString === '15') {
        return hoursNum + 0.25;
    }
    if (minutesString === '30') {
        return hoursNum + 0.5;
    }
    if (minutesString === '45') {
        return hoursNum + 0.75;
    }

    return hoursNum;
};

/*
    adds appropriate 15 minutes increment since endTime is rounded down
*/
export const endTimeFormatted = (timeString: string): number => {
    const minutesString = timeString.slice(3, 5);
    const hoursNum = Number(timeString.slice(0, 2));

    if (minutesString === '15') {
        return hoursNum + 0.5;
    }
    if (minutesString === '30') {
        return hoursNum + 0.75;
    }
    if (minutesString === '45') {
        return hoursNum + 1.0;
    }

    return hoursNum + 0.25;
};
