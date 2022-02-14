export type Email = string;
export type UserId = string;
export type EventPlanId = string;
export type EventId = string;
export type HourlyTimeFormat = 'hh' | 'HH';

/** users */
export type User = {
  uid: UserId;
  email: Email;
};

export type UserRecordDocument = {
  email: Email;
  firstName: string;
  lastName: string;
  hourlyTimeFormat: HourlyTimeFormat;
  uid: UserId;
};

export type UserAvailabilityHeatMapDocument = {
  data: number[];
};

/** event-plans */
export type EventPlanInfo = {
  name: string;
  description: string;
  dailyStartTime: string;
  dailyEndTime: string;
  startDate: string;
  endDate: string;
  hostId: UserId;
  hourlyTimeFormat: HourlyTimeFormat;
};

export type EventPlanDocument = EventPlanInfo & {
  invitees: UserId[];
  eventPlanId: EventPlanId;
};

/** events */
