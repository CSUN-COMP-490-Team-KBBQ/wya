import React from 'react';
// import './FinalizedEventList.css';
import { ListGroup } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';

import { EventInfo, EventId } from '../../interfaces';

interface EventListProps {
  elementId: string;
  events: Array<EventInfo & { eventId: EventId }>;
}

function sortEvents(
  events: Array<EventInfo & { eventId: EventId }>
): Array<EventInfo & { eventId: EventId }> {
  return events.sort((a, b) => {
    const aStart = Date.parse(a.startDate);
    const bStart = Date.parse(b.startDate);
    return aStart - bStart;
  });
}

export default function EventList(props: EventListProps): JSX.Element {
  const history = useHistory();
  const { elementId, events } = props;
  const eventList = sortEvents(events);

  return (
    <div id={elementId}>
      <h1 className="pb-4">Upcoming Events</h1>
      <ul role="list" className="space-y-3 px-20">
        {eventList.map(
          ({ eventId, name, startDate, dailyStartTime, dailyEndTime }) => (
            <li
              key={eventId}
              onClick={() => history.push(`/events/${eventId}`)}
              className="bg-white shadow overflow-hidden rounded-md px-6 py-4 text-center"
            >
              {/* Your content */}
              {name} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              {startDate} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              {dailyStartTime} - {dailyEndTime}
            </li>
          )
        )}
      </ul>
      {/* <ListGroup className="event-plan-list">
        {eventList.map(({ eventId, name }) => {
          return (
            <ListGroup.Item
              key={eventId}
              action
              onClick={() => history.push(`/events/${eventId}`)}
            >
              {name}
            </ListGroup.Item>
          );
        })}
      </ListGroup> */}
    </div>
  );
}
