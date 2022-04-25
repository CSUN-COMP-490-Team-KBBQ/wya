import React from 'react';
import { ListGroup } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';

import {
  EventPlanInfo,
  EventPlanId,
  EventPlanFinalizedFlag,
} from '../../interfaces';

import './EventPlanList.css';

interface EventPlanListProps {
  elementId: string;
  eventPlans: (EventPlanInfo & { eventPlanId: EventPlanId } & {
    isFinalized: EventPlanFinalizedFlag;
  })[];
}

function _sortEventPlans(
  eventPlans: (EventPlanInfo & { eventPlanId: EventPlanId } & {
    isFinalized: EventPlanFinalizedFlag;
  })[]
): (EventPlanInfo & { eventPlanId: EventPlanId } & {
  isFinalized: EventPlanFinalizedFlag;
})[] {
  return eventPlans.sort((a, b) => {
    const aStart = Date.parse(a.startDate);
    const bStart = Date.parse(b.startDate);
    return aStart - bStart;
  });
}

export default function EventPlanList(props: EventPlanListProps): JSX.Element {
  const history = useHistory();
  const eventPlans = _sortEventPlans(props.eventPlans);

  return (
    <div id={props.elementId}>
      <h1>Event Plans</h1>
      <ListGroup className="event-plan-list">
        {eventPlans.map(({ isFinalized, eventPlanId, name }) => {
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
