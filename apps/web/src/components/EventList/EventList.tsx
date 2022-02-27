import React from 'react';
import './EventList.css';
import { ListGroup } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import { EventInfo } from '../../interfaces/User';

interface EventListProps {
  elementId: string;
  events: EventInfo[];
}

function sortEvents(events: EventInfo[]): EventInfo[] {
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
      <h1>Events</h1>
      <ListGroup className="event-list">
        {eventList.map(({ eventId, name }) => {
          return (
            <ListGroup.Item
              key={eventId}
              action
              onClick={() => history.push(`/event/${eventId}`)}
            >
              {name}
            </ListGroup.Item>
          );
        })}
      </ListGroup>
    </div>
  );
}
