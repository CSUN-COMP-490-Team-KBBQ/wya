import moment from 'moment';
import EventData, { EventDataAvailability } from '../interfaces/EventData';

export const getFormValues = (formData: FormData, guests: string[]) : EventData => {
    let formValues = Object.fromEntries(formData.entries()) as unknown as EventData;
    formValues.startTime = moment(formValues.startTime, ['hh:mm A']).format(
      'HH:mm'
    );
    formValues.endTime = moment(formValues.endTime, ['hh:mm A']).format('HH:mm');
    formValues = { ...formValues, guests };

    return formValues;
}

export const getYTimesSorted = (
    availability: EventDataAvailability
): string[] => {
    return Object.keys(availability).sort();
};

export const getXDaysSorted = (
    yTimes: string[],
    availability: EventDataAvailability
): string[] => {
    return Object.keys(availability[yTimes[0]]).sort();
};

export const formatYTimes = (is24hr: boolean, yTimes: string[]): string[] => {
    return is24hr
        ? yTimes
        : yTimes.map((value) => {
              const temp =
                  (((Number(value.slice(0, 2)) + 11) % 12) + 1).toString() +
                  value.slice(2, 5);
              if (value.slice(0, 2) < '12') {
                  return `${temp} am`;
              }
              return `${temp} pm`;
          });
};

export const formatXDays = (xDays: string[]): string[] => {
    return xDays.map((timeStamp) =>
        new Date(Number(timeStamp)).toDateString().slice(0, 15)
    );
};

export const createAvailabilityDataArray = (
    yTimes: string[],
    xDays: string[],
    availability: EventDataAvailability
): number[][] => {
    return new Array(yTimes.length).fill(0).map((_k, y) => {
        return new Array(xDays.length).fill(0).map((_j, x) => {
            return availability[yTimes[y]][xDays[x]].length;
        });
    });
};

export const createCalendarAvailabilityDataArray = (
    userAvailability: Array<number>
): Array<Date> => {
    // userAvailability structure: [ { seconds: number, nanoseconds: number } ]
    // need to convert seconds to miliseconds to create a new date
    const scheduleData = userAvailability.map((value) => new Date(value));

    return scheduleData;
};

export const createZeroStateArray = (
    yTimesLen: number,
    xDaysLen: number
): number[][] => {
    return new Array(yTimesLen).fill(0).map(() => new Array(xDaysLen).fill(0));
};

export const createPreloadArray = (
    yTimes: string[],
    xDays: string[],
    userAvailability: Array<number>
): Array<Date> => {
    const scheduleData: Array<Date> = [];
    const convertedDate = userAvailability.map((value) => new Date(value));
    const scheduleDataDay = convertedDate.map((value) =>
        value.toDateString().slice(0, 3)
    );
    const scheduleDataTime = convertedDate.map((value) =>
        value.toTimeString().slice(0, 5)
    );

    for (let i = 0; i < userAvailability.length; i += 1) {
        const xIndex = xDays.findIndex((item) => {
            return item.slice(0, 3) === scheduleDataDay[i];
        });
        const yValue = yTimes.find((item) => {
            return item === scheduleDataTime[i];
        });

        for (let k = 0; xIndex + k < xDays.length; k += 7) {
            scheduleData.push(new Date(`${xDays[xIndex + k]} ${yValue}`));
        }
    }

    return scheduleData;
};

export const cleanUpUserAvailability = (
    userAvailability: Array<Date>
): Array<Date> => {
    for (let i = 0; i < userAvailability.length; i += 1) {
        if (userAvailability[i].toString() === 'Invalid Date') {
            userAvailability.splice(i, 1);
            i -= 1;
        }
    }

    return userAvailability;
};
