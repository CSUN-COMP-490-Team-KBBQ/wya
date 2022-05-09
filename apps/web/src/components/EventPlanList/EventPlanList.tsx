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
  const eventPlans = sortEventPlans(props.eventPlans);

  return (
    <div>
      <h1 className="py-4 flex justify-center">Pending Events</h1>
      <ul className="space-y-3 pr-8">
        {eventPlans
          .filter((eventPlan) => !eventPlan.isFinalized)
          .map((eventPlan) => (
            <li
              key={eventPlan.eventPlanId}
              onClick={() =>
                history.push(`/event-plans/${eventPlan.eventPlanId}`)
              }
              className="bg-white shadow overflow-hidden rounded-md px-6 py-4"
              style={{ cursor: 'pointer' }}
            >
              {/* Your content */}
              {eventPlan.name}
            </li>
          ))}
      </ul>
    </div>
  );
}
