import moment from 'moment';
import EventData, { EventDataAvailability } from '../interfaces/EventData';
import HeatMapData from '../interfaces/HeatMapData';
import ScheduleSelectorData from '../interfaces/ScheduleSelectorData';

export const sortObjectByKeys = <T>(item: T): string[] => {
    return Object.keys(item).sort();
};

export const formatYTimesTo12Or24Hour = (
    is24hr: boolean,
    yTimes: string[]
): string[] => {
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
export const formatXDaysToSlicedDateString = (xDays: string[]): string[] => {
    return xDays.map((timeStamp) =>
        new Date(Number(timeStamp)).toDateString().slice(0, 15)
    );
};

export const createHeatMapAvailabilityDataArray = (
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

export const createScheduleSelectorPreloadDataArray = (
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

export const removeInvalidDatesFromUserAvailability = (
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

export const createScheduleSelectorData = (
    userAvailability: number[],
    is24Hour: boolean
): ScheduleSelectorData => {
    const scheduleSelectorData: ScheduleSelectorData = {
        scheduleData: createCalendarAvailabilityDataArray(userAvailability),
        yTimesScheduleSelectorLabelsArray: [],
        xDaysFormattedToSlicedDateString: [],
        xDaysScheduleSelectorLabelsArray: [],
        yTimesFormattedTo12Or24Hour: [],
        is24Hour: is24Hour,
    };

    return scheduleSelectorData;
};

export const createHeatMapDataAndScheduleSelectorData = (
    eventAvailability: EventDataAvailability,
    userAvailability: number[],
    is24Hour: boolean
): [HeatMapData, ScheduleSelectorData] => {
    const sortedYTimesLabelsArray =
        sortObjectByKeys<EventDataAvailability>(eventAvailability);
    const formattedYTimesTo12Or24Hour = formatYTimesTo12Or24Hour(
        is24Hour,
        sortedYTimesLabelsArray
    );
    const sortedXDaysLabelsArray = sortObjectByKeys<{
        [date: string]: string[];
    }>(eventAvailability[sortedYTimesLabelsArray[0]]);
    const formattedXDaysToSlicedDateString = formatXDaysToSlicedDateString(
        sortedXDaysLabelsArray
    );

    const heatMapData: HeatMapData = {
        yTimesHeatMapLabelsArray: formattedYTimesTo12Or24Hour,
        xDaysHeatMapLabelsArray: sortedXDaysLabelsArray,
        xDaysFormattedToSlicedDateString: formattedXDaysToSlicedDateString,
        heatMap2dArray: createHeatMapAvailabilityDataArray(
            sortedYTimesLabelsArray,
            sortedXDaysLabelsArray,
            eventAvailability
        ),
    };

    const scheduleSelectorData: ScheduleSelectorData = {
        scheduleData: createScheduleSelectorPreloadDataArray(
            sortedYTimesLabelsArray,
            formattedXDaysToSlicedDateString,
            userAvailability
        ),
        yTimesScheduleSelectorLabelsArray: sortedXDaysLabelsArray,
        xDaysFormattedToSlicedDateString: formattedXDaysToSlicedDateString,
        xDaysScheduleSelectorLabelsArray: sortedYTimesLabelsArray,
        yTimesFormattedTo12Or24Hour: formattedYTimesTo12Or24Hour,
        is24Hour: is24Hour,
    };

    return [heatMapData, scheduleSelectorData];
};

export const appendUserAvailabilityToGroupEventAvailability = (
    xDays: string[],
    yTimes: string[],
    eventAvailability: EventDataAvailability,
    userAvailability: Array<Date>,
    uid: string
): EventDataAvailability => {
    removeInvalidDatesFromUserAvailability(userAvailability);

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

export const createEventAvailability = (
    startDate: string,
    endDate: string,
    startTime: string,
    endTime: string
): EventDataAvailability => {
    const endDateTimeStamp = moment(endDate);
    const endTimeTimeStamp = moment(endTime, 'HH:mm');
    const tempDateTimeStamp = moment(startDate);
    const tempTimeTimeStamp = moment(startTime, 'HH:mm');
    const days = {};
    const AvailabilityHeatMap = {};

    // creating days map
    while (tempDateTimeStamp.isSameOrBefore(endDateTimeStamp)) {
        const tempDays = {
            [tempDateTimeStamp.valueOf()]: [],
        };
        Object.assign(days, tempDays);
        tempDateTimeStamp.add(1, 'days');
    }

    // creating availability map
    while (tempTimeTimeStamp.isSameOrBefore(endTimeTimeStamp)) {
        const tempAvailabilityHeatMap = {
            [tempTimeTimeStamp.format('HH:mm')]: days,
        };
        Object.assign(AvailabilityHeatMap, tempAvailabilityHeatMap);
        tempTimeTimeStamp.add(15, 'minutes');
    }

    return AvailabilityHeatMap;
};

export const convertUserAvailabilityDateArrayToTimestampArray = (
    userAvailabilityData: Date[]
): number[] => {
    return userAvailabilityData.map((value) => value.getTime());
};

export const createAndAppendAvailability = (
    eventDataWithoutAvail: EventData
): EventData => {
    const availability = createEventAvailability(
        eventDataWithoutAvail.startDate,
        eventDataWithoutAvail.endDate,
        eventDataWithoutAvail.startTime,
        eventDataWithoutAvail.endTime
    );

    return { ...eventDataWithoutAvail, availability };
};
