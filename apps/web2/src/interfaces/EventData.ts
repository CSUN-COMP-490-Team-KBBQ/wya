import { EventPlanAvailabilityDocument } from '../interfaces';

type EventPlanId = string;
type UserId = string;
type Email = string;

export default interface EventData {
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
  hostId: UserId;
  invitees: UserId[] | Email[];
  eventPlanId: EventPlanId;
  availability: EventPlanAvailabilityDocument;
  isFinalized: boolean;
  day: string;
  rsvp: string[];
}
