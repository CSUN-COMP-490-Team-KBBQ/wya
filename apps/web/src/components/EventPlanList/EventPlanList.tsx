import React from 'react';
import './EventPlanList.css';
import { ListGroup } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import { EventPlanInfo, EventPlanId } from 'wya-api/dist/interfaces';

interface EventPlanListProps {
  elementId: string;
  eventPlans: Array<EventPlanInfo & { eventPlanId: EventPlanId }>;
}

function sortEvents(
  events: Array<EventPlanInfo & { eventPlanId: EventPlanId }>
): Array<EventPlanInfo & { eventPlanId: EventPlanId }> {
  return events.sort((a, b) => {
    const aStart = Date.parse(a.startDate);
    const bStart = Date.parse(b.startDate);
    return aStart - bStart;
  });
}

export default function EventPlanList(props: EventPlanListProps): JSX.Element {
  const history = useHistory();
  const { elementId, eventPlans } = props;
  const eventList = sortEvents(eventPlans);

  return (
    <div id={elementId}>
      <h1>Event Plans</h1>
      <ListGroup className="event-plan-list">
        {eventList.map(({ eventPlanId, name }) => {
          return (
            <ListGroup.Item
              key={eventPlanId}
              action
              onClick={() => history.push(`/event-plans/${eventPlanId}`)}
            >
              {name}
            </ListGroup.Item>
          );
        })}
      </ListGroup>
    </div>
  );
}
