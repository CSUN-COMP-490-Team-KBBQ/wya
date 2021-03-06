/**
 * RO3: Copied in web/src/interfaces
 */
export const TIME_FORMAT = {
  TWELVE_HOURS: 'hh:mm a',
  TWENTY_FOUR_HOURS: 'HH:mm',
};

export enum DOCUMENT_TYPE {
  USER = 'USER',
  EVENT_PLAN = 'EVENT_PLAN',
  EVENT = 'EVENT',
}

/** users */
export type UserId = string;
export type Email = string;

export type User = {
  uid: UserId;
  email: Email;
};

export type UserDocument = {
  email: Email;
  firstName: string;
  lastName: string;
  timeFormat: string;
  uid: UserId;
};

export type UserAvailabilityHeatMapDocument = {
  data: number[];
};

export type UserEventPlanDocument = {
  name: string;
  description: string;
  dailyStartTime: string;
  dailyEndTime: string;
  startDate: string;
  endDate: string;
};

export type UserEventDocument = {
  name: string;
  description: string;
  // Date times
  day: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
};

export enum FRIEND_REQUEST_STATUS {
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  PENDING = 'PENDING',
}

/** event-plans */
export enum EVENT_PLAN_ROLE {
  HOST = 'HOST',
  INVITEE = 'INVITEE',
}

export type EventPlanFinalizedFlag = boolean;

export type EventPlanInfo = {
  name: string;
  description: string;
  dailyStartTime: string;
  dailyEndTime: string;
  startDate: string;
  endDate: string;
};

export type EventPlanId = string;
export type EventPlanDocument = {
  name: string;
  description: string;
  dailyStartTime: string;
  dailyEndTime: string;
  startDate: string;
  endDate: string;
  hostId: UserId;
  inviteesByUserId: UserId[];
  eventPlanId: EventPlanId;
};

export type EventPlanAvailabilityDocument = {
  data: {
    [time: string]: {
      [date: string]: string[];
    };
  };
  // Should always be included in this document but some web components don't
  // need this. This is mainly used for api authorization.
  uid?: UserId;
};

/** events */
export enum EVENT_ROLE {
  GUEST = 'GUEST',
  HOST = 'HOST',
}
export type EventInfo = {
  name: string;
  description: string;
  hostId: UserId;
  // Date times
  day: string;
  startDate: string;
  endDate: string;
  dailyStartTime: string;
  dailyEndTime: string;
};

export type EventId = string;
export type EventDocument = {
  name: string;
  description: string;
  hostId: UserId;
  // Date times
  day: string;
  startDate: string;
  endDate: string;
  dailyStartTime: string;
  dailyEndTime: string;
  eventId: EventId;
};

export enum EVENT_GUEST_STATUS {
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  PENDING = 'PENDING',
}
export type EventGuest = {
  uid: UserId;
  firstName: string;
  lastName: string;
  // email: Email;
  status: EVENT_GUEST_STATUS;
};
/** End of RO3 */

// web specific interfaces below

export const SUPPORTED_TIME_FORMATS = [
  'h:mm a',
  'h:mm A',
  'hh:mm a',
  'hh:mm A',
  'HH:mm',
];

export interface HeatMapData {
  yTimesHeatMapLabelsArray: string[];
  xDaysHeatMapLabelsArray: string[];
  xDaysFormattedToSlicedDateString: string[];
  heatMap2dArray: number[][];
}

export interface ScheduleSelectorData {
  scheduleData: Date[];
  xDaysScheduleSelectorLabelsArray: string[];
  xDaysFormattedToSlicedDateString: string[];
  yTimesScheduleSelectorLabelsArray: string[];
  yTimesFormattedTo12Or24Hour: string[];
  timeFormat: string;
}

export type EventPlan = {
  name: string;
  description: string;
  dailyStartTime: string;
  dailyEndTime: string;
  startDate: string;
  endDate: string;
  eventPlanId: EventPlanId;
  isFinalized: EventPlanFinalizedFlag;
};
