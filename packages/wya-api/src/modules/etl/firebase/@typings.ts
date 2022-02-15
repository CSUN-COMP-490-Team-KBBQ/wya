/** users */
export type UserId = string;
export type Email = string;

export type User = {
  uid: UserId;
  email: Email;
};

export type HourlyTimeFormat = 'hh' | 'HH';
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

export type UserEventPlanDocument = Exclude<
  EventPlanInfo,
  { hostId: UserId }
> & {
  role: EventPlanRole;
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
  hourlyTimeFormat: HourlyTimeFormat;
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
