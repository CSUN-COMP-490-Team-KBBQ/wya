export enum TimeFormat {
  TWELVE_HOURS = 'hh:mm a',
  TWENTY_FOUR_HOURS = 'HH:mm',
}

/** users */
export type UserId = string;
export type Email = string;

export type User = {
  uid: UserId;
  email: Email;
};

export type UserRecordDocument = {
  email: Email;
  firstName: string;
  lastName: string;
  timeFormat: TimeFormat;
  uid: UserId;
};

export type UserAvailabilityHeatMapDocument = {
  data: number[];
};

export type UserEventPlanDocument = Omit<EventPlanInfo, 'hostId'> & {
  role: EventPlanRole;
};

export type UserEventDocument = Omit<EventInfo, 'hostId'> & {
  role: EventRole;
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
  hostId: UserId;
};

export type EventPlanId = string;
export type EventPlanDocument = EventPlanInfo & {
  invitees: UserId[];
  eventPlanId: EventPlanId;
};

export type EventPlanAvailabilityDocument = {
  data: {
    [time: string]: {
      [date: string]: UserId[];
    };
  };
};

/** events */
export type EventRole = 'GUEST' | 'HOST';
export type EventInfo = {
  name: string;
  description: string;
  hostId: UserId;
  // Date times
  day: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
};

export type EventId = string;
export type EventDocument = EventInfo & {
  eventId: EventId;
};

export type EventGuestStatus = 'ACCEPTED' | 'DECLINED' | 'PENDING';
export type EventGuest = User & {
  status: EventGuestStatus;
};
