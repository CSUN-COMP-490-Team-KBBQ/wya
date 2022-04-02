import moment from 'moment';
import { EventPlanDocument } from '../../../../packages/wya-api/src/interfaces';
import EventData, { EventDataAvailability } from '../interfaces/EventData';
import HeatMapData from '../interfaces/HeatMapData';
import ScheduleSelectorData from '../interfaces/ScheduleSelectorData';

/** RO3: copied from wya-api/lib/format-time-string */
const SUPPORTED_TIME_FORMATS = [
  'h:mm a',
  'h:mm A',
  'hh:mm a',
  'hh:mm A',
  'HH:mm',
];
/** End of RO3 */

export const sortObjectByKeys = <T>(item: T): string[] => {
  return Object.keys(item).sort();
};

export const formatYTimesTo12Or24Hour = (
  timeFormat: string,
  yTimes: string[]
): string[] => {
  return yTimes.map((value) =>
    moment(value, SUPPORTED_TIME_FORMATS).format(timeFormat)
  );
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
  userAvailability: Date[]
): Date[] => {
  return userAvailability.filter((date) => date.toString() !== 'Invalid Date');
};

export const createScheduleSelectorData = (
  userAvailability: number[],
  timeFormat: string
): ScheduleSelectorData => {
  const scheduleSelectorData: ScheduleSelectorData = {
    scheduleData: createCalendarAvailabilityDataArray(userAvailability),
    xDaysScheduleSelectorLabelsArray: [],
    xDaysFormattedToSlicedDateString: [],
    yTimesScheduleSelectorLabelsArray: [],
    yTimesFormattedTo12Or24Hour: [],
    timeFormat: timeFormat,
  };

  return scheduleSelectorData;
};

export const createHeatMapDataAndScheduleSelectorData = (
  eventPlanData: EventPlanDocument,
  eventPlanAvailability: EventDataAvailability,
  userAvailability: number[],
  timeFormat: string
): [EventDataAvailability, HeatMapData, ScheduleSelectorData] => {
  const createdEventPlanAvailability: EventDataAvailability =
    Object.keys(eventPlanAvailability).length === 0
      ? createEventPlanAvailability(
          eventPlanData.startDate,
          eventPlanData.endDate,
          eventPlanData.dailyStartTime,
          eventPlanData.dailyEndTime
        )
      : { ...eventPlanAvailability };

  const sortedYTimesLabelsArray = sortObjectByKeys<EventDataAvailability>({
    ...createdEventPlanAvailability,
  });
  const formattedYTimesTo12Or24Hour = formatYTimesTo12Or24Hour(
    timeFormat,
    sortedYTimesLabelsArray
  );
  const sortedXDaysLabelsArray = sortObjectByKeys<{
    [date: string]: string[];
  }>({ ...createdEventPlanAvailability[sortedYTimesLabelsArray[0]] });
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
      { ...createdEventPlanAvailability }
    ),
  };

  const scheduleSelectorData: ScheduleSelectorData = {
    scheduleData: createScheduleSelectorPreloadDataArray(
      sortedYTimesLabelsArray,
      formattedXDaysToSlicedDateString,
      userAvailability
    ),
    xDaysScheduleSelectorLabelsArray: sortedXDaysLabelsArray,
    xDaysFormattedToSlicedDateString: formattedXDaysToSlicedDateString,
    yTimesScheduleSelectorLabelsArray: sortedYTimesLabelsArray,
    yTimesFormattedTo12Or24Hour: formattedYTimesTo12Or24Hour,
    timeFormat: timeFormat,
  };

  return [createdEventPlanAvailability, heatMapData, scheduleSelectorData];
};

export const appendUserAvailabilityToGroupEventPlanAvailability = (
  xDays: string[],
  yTimes: string[],
  eventPlanAvailability: EventDataAvailability,
  userAvailability: Array<Date>,
  uid: string
): EventDataAvailability => {
  removeInvalidDatesFromUserAvailability(userAvailability);

  // removes uid from each cell to start from scratch
  for (let i = 0; i < yTimes.length; i += 1) {
    for (let j = 0; j < xDays.length; j += 1) {
      if (eventPlanAvailability[yTimes[i]][xDays[j]].includes(uid)) {
        const removeIndex = eventPlanAvailability[yTimes[i]][
          xDays[j]
        ].findIndex((item) => {
          return item === uid;
        });

        eventPlanAvailability[yTimes[i]][xDays[j]].splice(removeIndex, 1);
      }
    }
  }

  // add uid to each appropriate cell
  for (let i = 0; i < userAvailability.length; i += 1) {
    const time: string = userAvailability[i].toTimeString().slice(0, 5);
    const temp: Date = new Date(
      userAvailability[i].toDateString().slice(0, 15)
    );
    const day: string = temp.getTime().toString();
    if (eventPlanAvailability[time][day].includes(uid)) {
      // eslint-disable-next-line
      console.log('User already HERE');
    } else {
      eventPlanAvailability[time][day].push(uid);
    }
  }

  return eventPlanAvailability;
};

export const createEventPlanAvailability = (
  startDate: string,
  endDate: string,
  startTime: string,
  endTime: string
): EventDataAvailability => {
  const endDateTimeStamp = moment(endDate);
  const endTimeTimeStamp = moment(endTime, 'HH:mm');
  const tempDateTimeStamp = moment(startDate);
  const tempTimeTimeStamp = moment(startTime, 'HH:mm');
  let days: {
    [date: string]: string[];
  } = {};
  let AvailabilityHeatMap: EventDataAvailability = {};

  // creating days map
  while (tempDateTimeStamp.isSameOrBefore(endDateTimeStamp)) {
    days = { ...days, [`${tempDateTimeStamp.valueOf()}`]: [] };
    tempDateTimeStamp.add(1, 'days');
  }
  days = JSON.parse(JSON.stringify(days));

  console.log(days);

  // creating availability map
  while (tempTimeTimeStamp.isSameOrBefore(endTimeTimeStamp)) {
    AvailabilityHeatMap = {
      ...AvailabilityHeatMap,
      [tempTimeTimeStamp.format('HH:mm')]: { ...days },
    };
    tempTimeTimeStamp.add(15, 'minutes');
  }

  // This is create a true copy of AvailabilityHeatMap
  // The spread operator (...) and Object.assign() only go one level deep when making a copy
  AvailabilityHeatMap = JSON.parse(JSON.stringify(AvailabilityHeatMap));

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
  const availability = createEventPlanAvailability(
    eventDataWithoutAvail.startDate,
    eventDataWithoutAvail.endDate,
    eventDataWithoutAvail.startTime,
    eventDataWithoutAvail.endTime
  );

  return { ...eventDataWithoutAvail, availability };
};