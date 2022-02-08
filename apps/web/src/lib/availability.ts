import moment from 'moment';
import { EventDataAvailability } from '../interfaces/EventData';
import HeatMapData from '../interfaces/HeatMapData';
import ScheduleSelectorData from '../interfaces/ScheduleSelectorData';

export const sortObjectByKeys = <T>(item: T): string[] => {
    return Object.keys(item).sort();
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

/**
    Formats days to 'ddd MMM DD YYYY'
    Cannot use moment since this is being used by heatmap and expects a date
 **/
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

export const setHeatMapAndScheduleSelectorData = (
    eventAvailability: EventDataAvailability,
    userAvailability: number[],
    is24Hour: boolean
): [HeatMapData, ScheduleSelectorData] => {
    const sortedYTimes =
        sortObjectByKeys<EventDataAvailability>(eventAvailability);
    const formattedYTimes = formatYTimes(is24Hour, sortedYTimes);
    const sortedXDays = sortObjectByKeys<{
        [date: string]: string[];
    }>(eventAvailability[sortedYTimes[0]]);
    const formattedXDays = formatXDays(sortedXDays);

    const heatMapData = {
        yData: formattedYTimes,
        xData: sortedXDays,
        xDataFormatted: formattedXDays,
        mapData: createAvailabilityDataArray(
            sortedYTimes,
            sortedXDays,
            eventAvailability
        ),
    };

    const scheduleSelectorData = {
        scheduleData: createPreloadArray(
            sortedYTimes,
            formattedXDays,
            userAvailability
        ),
        sortedXData: sortedXDays,
        formattedXData: formattedXDays,
        sortedYData: sortedYTimes,
        formattedYData: formattedYTimes,
        is24Hour: is24Hour,
    };

    return [heatMapData, scheduleSelectorData];
};

export const appendUserAvailabilityToGroup = (
    xDays: string[],
    yTimes: string[],
    eventAvailability: EventDataAvailability,
    userAvailability: Array<Date>,
    uid: string
): EventDataAvailability => {
    cleanUpUserAvailability(userAvailability);

    // removes uid from each cell to start from scratch
    for (let i = 0; i < yTimes.length; i += 1) {
        for (let j = 0; j < xDays.length; j += 1) {
            if (eventAvailability[yTimes[i]][xDays[j]].includes(uid)) {
                const removeIndex = eventAvailability[yTimes[i]][
                    xDays[j]
                ].findIndex((item) => {
                    return item === uid;
                });
                eventAvailability[yTimes[i]][xDays[j]].splice(removeIndex, 1);
            }
        }
    }

    // add uid to each appropriate cell
    for (let i = 0; i < userAvailability.length; i += 1) {
        const time = userAvailability[i].toTimeString().slice(0, 5);
        const temp = new Date(userAvailability[i].toDateString().slice(0, 15));
        const day = temp.getTime().toString();
        if (eventAvailability[time][day].includes(uid)) {
            // eslint-disable-next-line
            console.log('User already HERE');
        } else {
            eventAvailability[time][day].push(uid);
        }
    }

    return eventAvailability;
};
