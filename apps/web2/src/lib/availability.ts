import _ from 'lodash';
import moment from 'moment';

import {
  SUPPORTED_TIME_FORMATS,
  EventPlanDocument,
  EventPlanAvailabilityDocument,
  HeatMapData,
  ScheduleSelectorData,
} from '../interfaces';

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
  availabilityDocument: EventPlanAvailabilityDocument
): number[][] => {
  return new Array(yTimes.length).fill(0).map((_k, y) => {
    return new Array(xDays.length).fill(0).map((_j, x) => {
      return availabilityDocument.data[yTimes[y]][xDays[x]].length;
    });
  });
};

export const createCalendarAvailabilityDataArray = (
  userAvailability: Array<number>
): Date[] => {
  const scheduleData = userAvailability.map((value) => new Date(value));

  return scheduleData;
};

export const createScheduleSelectorPreloadDataArray = (
  yTimes: string[],
  xDays: string[],
  userAvailability: Array<number>
): Date[] => {
  const scheduleData: Date[] = [];
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
  userEventPlanAvailability: EventPlanAvailabilityDocument,
  mergedEventPlanAvailabilitiesDocument: EventPlanAvailabilityDocument,
  userAvailability: number[],
  timeFormat: string
): [EventPlanAvailabilityDocument, HeatMapData, ScheduleSelectorData] => {
  const createdUserPlanAvailabilityDocument: EventPlanAvailabilityDocument =
    Object.keys(userEventPlanAvailability.data).length === 0
      ? createEventPlanAvailability(
          eventPlanData.startDate,
          eventPlanData.endDate,
          eventPlanData.dailyStartTime,
          eventPlanData.dailyEndTime
        )
      : { ...userEventPlanAvailability };

  const createdMergedEventPlanAvailabilitiesDocument: EventPlanAvailabilityDocument =
    Object.keys(mergedEventPlanAvailabilitiesDocument.data).length === 0
      ? createEventPlanAvailability(
          eventPlanData.startDate,
          eventPlanData.endDate,
          eventPlanData.dailyStartTime,
          eventPlanData.dailyEndTime
        )
      : { ...mergedEventPlanAvailabilitiesDocument };

  const sortedYTimesLabelsArray: string[] = sortObjectByKeys<{
    [time: string]: { [date: string]: string[] };
  }>(createdUserPlanAvailabilityDocument.data);

  const formattedYTimesTo12Or24Hour = formatYTimesTo12Or24Hour(
    timeFormat,
    sortedYTimesLabelsArray
  );
  const sortedXDaysLabelsArray: string[] = sortObjectByKeys<{
    [date: string]: string[];
  }>(createdUserPlanAvailabilityDocument.data[sortedYTimesLabelsArray[0]]);
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
      { ...createdMergedEventPlanAvailabilitiesDocument }
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

  return [
    createdUserPlanAvailabilityDocument,
    heatMapData,
    scheduleSelectorData,
  ];
};

export const appendUserAvailabilityToGroupEventPlanAvailability = (
  xDays: string[],
  yTimes: string[],
  eventPlanAvailabilityDocument: EventPlanAvailabilityDocument,
  userAvailability: Date[],
  uid: string
): EventPlanAvailabilityDocument => {
  userAvailability = removeInvalidDatesFromUserAvailability(userAvailability);

  // removes uid from each cell to start from scratch
  for (let i = 0; i < yTimes.length; i += 1) {
    for (let j = 0; j < xDays.length; j += 1) {
      if (
        eventPlanAvailabilityDocument.data[yTimes[i]][xDays[j]].includes(uid)
      ) {
        const removeIndex = eventPlanAvailabilityDocument.data[yTimes[i]][
          xDays[j]
        ].findIndex((item) => {
          return item === uid;
        });

        eventPlanAvailabilityDocument.data[yTimes[i]][xDays[j]].splice(
          removeIndex,
          1
        );
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
    if (eventPlanAvailabilityDocument.data[time][day].includes(uid)) {
      // eslint-disable-next-line
      console.log('User already HERE');
    } else {
      eventPlanAvailabilityDocument.data[time][day].push(uid);
    }
  }

  return eventPlanAvailabilityDocument;
};

export const createEventPlanAvailability = (
  startDate: string,
  endDate: string,
  startTime: string,
  endTime: string
): EventPlanAvailabilityDocument => {
  const endDateTimeStamp = moment(endDate);
  const endTimeTimeStamp = moment(endTime, 'HH:mm');
  const tempDateTimeStamp = moment(startDate);
  const tempTimeTimeStamp = moment(startTime, 'HH:mm');
  let days: {
    [date: string]: string[];
  } = {};
  let AvailabilityHeatMap: EventPlanAvailabilityDocument = { data: {} };

  // creating days map
  while (tempDateTimeStamp.isSameOrBefore(endDateTimeStamp)) {
    days = { ...days, [`${tempDateTimeStamp.valueOf()}`]: [] };
    tempDateTimeStamp.add(1, 'days');
  }
  days = JSON.parse(JSON.stringify(days));

  // creating availability map
  while (tempTimeTimeStamp.isSameOrBefore(endTimeTimeStamp)) {
    AvailabilityHeatMap.data = {
      ...AvailabilityHeatMap.data,
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

export const mergeEventPlanAvailabilities = (
  availabilities: EventPlanAvailabilityDocument[]
): EventPlanAvailabilityDocument => {
  function tempCustom(objValue: any, srcValue: any) {
    if (_.isArray(objValue)) {
      return objValue.concat(srcValue);
    }
  }
  const len = availabilities.length;
  let mergedAvailabilities: EventPlanAvailabilityDocument = { data: {} };

  // iterate through each user's event-plan availability
  for (let i = 0; i < len; i++) {
    const userAvailabilityTimes = Object.keys(availabilities[i].data);
    // if a user's availability is not empty
    if (userAvailabilityTimes.length !== 0) {
      _.mergeWith(mergedAvailabilities, availabilities[i], tempCustom);
    }
  }

  return mergedAvailabilities;
};
