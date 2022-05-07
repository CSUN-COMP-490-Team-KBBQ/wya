import { useHistory } from 'react-router-dom';

import { EventPlan } from '../../interfaces';

interface EventPlanListProps {
  elementId: string;
  eventPlans: EventPlan[];
}

function sortEventPlans(eventPlans: EventPlan[]): EventPlan[] {
  return eventPlans.sort((a, b) => {
    const aStart = Date.parse(a.startDate);
    const bStart = Date.parse(b.startDate);
    return aStart - bStart;
  });
}

export default function EventPlanList(props: EventPlanListProps): JSX.Element {
  const history = useHistory();
  const { elementId, eventPlans } = props;
  const eventList = sortEventPlans(eventPlans);

  return (
    <div id={elementId}>
      <h1 className="py-4 flex justify-center">Pending Events</h1>
      <ul className="space-y-3 pr-8">
        {eventList.map(({ isFinalized, eventPlanId, name }) => {
          if (!isFinalized) {
            return (
              <li
                key={eventPlanId}
                onClick={() => history.push(`/event-plans/${eventPlanId}`)}
                className="bg-white shadow overflow-hidden rounded-md px-6 py-4"
              >
                {/* Your content */}
                {name}
              </li>
            );
          }
          return <></>;
        })}
      </ul>
    </div>
  );
}
