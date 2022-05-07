import React from 'react';
import Calendar from '../../components/Calendar/Calendar';
import EventPlanList from '../../components/EventPlanList/EventPlanList';
import EventList from '../../components/EventList/EventList';
import { useUserRecordContext } from '../../contexts/UserRecordContext';

import { getAllSubCollDocsSnapshot$ } from '../../lib/firestore';

import { EventPlan, EventId, EventInfo } from '../../interfaces/';
import PageSpinner from '../../components/PageSpinner/PageSpinner';
import Sidebar from '../../components/Sidebar/Sidebar';
import LandingPage from '../LandingPage/LandingPage';

export default function DashboardPage(): JSX.Element {
  const { userRecord, pending } = useUserRecordContext();

  const [eventPlans, setEventPlans] = React.useState<EventPlan[]>([]);
  const [events, setEvents] = React.useState<
    (EventInfo & { eventId: EventId })[]
  >([]);

  const [eventsFiltered, setEventsFiltered] = React.useState<
    (EventInfo & { eventId: EventId })[]
  >([]);

  // Observe user availability
  React.useEffect(() => {
    if (userRecord) {
      const { uid } = userRecord;

      // Get event-plans
      getAllSubCollDocsSnapshot$(`/users/${uid}/event-plans`, {
        next: (eventPlansSnapshot) => {
          setEventPlans(
            eventPlansSnapshot.docs.map((doc) => {
              return {
                eventPlanId: doc.id,
                ...doc.data(),
              } as EventPlan;
            })
          );
        },
      });

      // Get events
      getAllSubCollDocsSnapshot$(`/users/${uid}/events`, {
        next: (eventsSnapshot) => {
          setEvents(
            eventsSnapshot.docs.map((doc) => {
              return {
                eventId: doc.id as EventId,
                ...(doc.data() as EventInfo),
              };
            })
          );

          setEventsFiltered(
            eventsSnapshot.docs.map((doc) => {
              return {
                eventId: doc.id as EventId,
                ...(doc.data() as EventInfo),
              };
            })
          );
        },
      });
    }
  }, [userRecord]);

  // Observe user events
  if (pending) {
    return <PageSpinner />;
  }

  if (userRecord) {
    return (
      <Sidebar>
        {/* 3 column wrapper */}
        <div className="flex-grow w-full max-w-7xl mx-auto xl:px-8 lg:flex bg-white">
          {/* Left sidebar & main wrapper */}
          <div className="flex-1 min-w-0 bg-white xl:flex">
            <div className="bg-white lg:min-w-0 lg:flex-1">
              <div className="h-full py-6 px-4 sm:px-6 lg:px-8">
                {/* Start left area*/}
                {/* Calendar Section Start */}

                <div
                  className="relative h-full"
                  style={{ height: '33rem', width: 'auto', margin: 'auto' }}
                >
                  <div className="absolute inset-0 overflow-y-auto bg-white">
                    <h1 className="pt-4 flex justify-center">Calendar</h1>
                    <Calendar
                      events={events}
                      setEventsFiltered={setEventsFiltered}
                    />
                  </div>
                </div>
                {/* Calendar Section End */}
                {/* Upcoming Section Start */}
                <div
                  className="relative h-full"
                  style={{ width: 'auto', margin: 'auto' }}
                >
                  <EventList
                    elementId="calendar-event-plan-list"
                    eventsFiltered={eventsFiltered}
                  />
                </div>
                {/* Upcoming Section End */}
                {/* End left area */}
              </div>
            </div>

            <div className="bg-white lg:min-w-0 lg:flex-1">
              <div className="h-full py-6 px-4 sm:px-6 lg:px-8">
                {/* Start right area*/}
                {/* Pending Events Start*/}
                <div
                  className="relative h-full"
                  style={{ height: '40rem', width: 'auto', margin: 'auto' }}
                >
                  <div className="absolute inset-0 overflow-y-auto bg-white">
                    <EventPlanList elementId="" eventPlans={eventPlans} />
                  </div>
                </div>
                {/* Pending Events End*/}
                {/* End right area */}
              </div>
            </div>
          </div>
        </div>
      </Sidebar>
    );
  }

  return <LandingPage />;
}
