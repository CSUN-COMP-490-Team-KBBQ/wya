import { useHistory } from 'react-router-dom';

import { EventInfo, EventId } from '../../interfaces';

interface EventListProps {
  elementId: string;
  events: (EventInfo & { eventId: EventId })[];
}

function sortEvents(
  events: (EventInfo & { eventId: EventId })[]
): (EventInfo & { eventId: EventId })[] {
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
      <h1 className="py-4 flex justify-center">Upcoming Events</h1>
      <ul className="space-y-3 pr-8">
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
    </div>
  );
}
