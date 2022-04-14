import React from 'react';
import './EventPlanList.css';
import { ListGroup } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';

import {
  EventPlanInfo,
  EventPlanId,
  EventPlanFinalizedFlag,
} from '../../interfaces';

interface EventPlanListProps {
  elementId: string;
  eventPlans: (EventPlanInfo & { eventPlanId: EventPlanId } & {
    isFinalized: EventPlanFinalizedFlag;
  })[];
}

function sortEvents(
  events: (EventPlanInfo & { eventPlanId: EventPlanId } & {
    isFinalized: EventPlanFinalizedFlag;
  })[]
): (EventPlanInfo & { eventPlanId: EventPlanId } & {
  isFinalized: EventPlanFinalizedFlag;
})[] {
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
        {eventList.map(({ isFinalized, eventPlanId, name }) => {
          if (!isFinalized) {
            return (
              <ListGroup.Item
                key={eventPlanId}
                action
                onClick={() => history.push(`/event-plans/${eventPlanId}`)}
              >
                {name}
              </ListGroup.Item>
            );
          }
          return <></>;
        })}
      </ListGroup>
    </div>
  );
}
