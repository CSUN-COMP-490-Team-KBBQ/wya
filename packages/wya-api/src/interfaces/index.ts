/**
 * RO3: Copied in web/src/interfaces
 */
export const TIME_FORMAT = {
  TWELVE_HOURS: 'hh:mm a',
  TWENTY_FOUR_HOURS: 'HH:mm',
};

/** users */
export type User = {
  uid: string;
  email: string;
};

export type UserDocument = {
  email: string;
  firstName: string;
  lastName: string;
  timeFormat: string;
  uid: string;
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

/** event-plans */
export type EventPlanRole = 'INVITEE' | 'HOST';
export type EventPlanInfo = {
  name: string;
  description: string;
  dailyStartTime: string;
  dailyEndTime: string;
  startDate: string;
  endDate: string;
  hostId: string;
};

export type EventPlanId = string;
export type EventPlanDocument = {
  name: string;
  description: string;
  dailyStartTime: string;
  dailyEndTime: string;
  startDate: string;
  endDate: string;
  hostId: string;
  invitees: string[];
  eventPlanId: EventPlanId;
};

export type EventPlanAvailabilityDocument = {
  data: {
    [time: string]: {
      [date: string]: string[];
    };
  };
};

/** events */
export type EventRole = 'GUEST' | 'HOST';
export type EventInfo = {
  name: string;
  description: string;
  hostId: string;
  // Date times
  day: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
};

export type EventId = string;
export type EventDocument = {
  name: string;
  description: string;
  hostId: string;
  // Date times
  day: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  eventId: EventId;
};

export type EventGuestStatus = 'ACCEPTED' | 'DECLINED' | 'PENDING';
export type EventGuest = {
  uid: string;
  email: string;
  status: EventGuestStatus;
};
/** End of RO3 */
