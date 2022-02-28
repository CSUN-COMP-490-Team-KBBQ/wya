import moment from 'moment';
import { EventPlanDocument } from 'wya-api/dist/interfaces';
import EventData, { EventDataAvailability } from '../interfaces/EventData';
import HeatMapData from '../interfaces/HeatMapData';
import ScheduleSelectorData from '../interfaces/ScheduleSelectorData';

export const sortObjectByKeys = <T>(item: T): string[] => {
  return Object.keys(item).sort();
};

export const formatYTimesTo12Or24Hour = (
  hourlyTimeFormat: boolean,
  yTimes: string[]
): string[] => {
  return hourlyTimeFormat
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
  userAvailability: Date[]
): Date[] => {
  return userAvailability.filter((date) => date.toString() !== 'Invalid Date');
};

export const createScheduleSelectorData = (
  userAvailability: number[],
  hourlyTimeFormat: boolean
): ScheduleSelectorData => {
  const scheduleSelectorData: ScheduleSelectorData = {
    scheduleData: createCalendarAvailabilityDataArray(userAvailability),
    xDaysScheduleSelectorLabelsArray: [],
    xDaysFormattedToSlicedDateString: [],
    yTimesScheduleSelectorLabelsArray: [],
    yTimesFormattedTo12Or24Hour: [],
    hourlyTimeFormat: hourlyTimeFormat,
  };

  return scheduleSelectorData;
};

export const createHeatMapDataAndScheduleSelectorData = (
  eventPlanData: EventPlanDocument,
  eventPlanAvailability: EventDataAvailability,
  userAvailability: number[],
  hourlyTimeFormat: boolean
): [EventDataAvailability, HeatMapData, ScheduleSelectorData] => {
  if (Object.keys(eventPlanAvailability).length == 0) {
    eventPlanAvailability = createEventPlanAvailability(
      eventPlanData.startDate,
      eventPlanData.endDate,
      eventPlanData.dailyStartTime,
      eventPlanData.dailyEndTime
    );
  } else {
  }

  const sortedYTimesLabelsArray = sortObjectByKeys<EventDataAvailability>(
    eventPlanAvailability
  );
  const formattedYTimesTo12Or24Hour = formatYTimesTo12Or24Hour(
    hourlyTimeFormat,
    sortedYTimesLabelsArray
  );
  const sortedXDaysLabelsArray = sortObjectByKeys<{
    [date: string]: string[];
  }>(eventPlanAvailability[sortedYTimesLabelsArray[0]]);
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
      eventPlanAvailability
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
    hourlyTimeFormat: hourlyTimeFormat,
  };

  return [eventPlanAvailability, heatMapData, scheduleSelectorData];
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
    const time = userAvailability[i].toTimeString().slice(0, 5);
    const temp = new Date(userAvailability[i].toDateString().slice(0, 15));
    const day = temp.getTime().toString();
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
  const availability = createEventPlanAvailability(
    eventDataWithoutAvail.startDate,
    eventDataWithoutAvail.endDate,
    eventDataWithoutAvail.startTime,
    eventDataWithoutAvail.endTime
  );

  return { ...eventDataWithoutAvail, availability };
};
