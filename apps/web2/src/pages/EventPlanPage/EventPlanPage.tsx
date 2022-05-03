import React from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import {
  getAllSubCollDocsSnapshot$,
  getDocSnapshot$,
} from '../../lib/firestore';
import {
  createHeatMapDataAndScheduleSelectorData,
  mergeEventPlanAvailabilities,
} from '../../lib/availability';
import { isUserAHost } from '../../lib/eventHelpers';
import {
  EventPlanDocument,
  EventPlanAvailabilityDocument,
  HeatMapData,
  ScheduleSelectorData,
} from '../../interfaces';

import { useUserRecordContext } from '../../contexts/UserRecordContext';
import EventPlanning from './EventPlanning';

import './EventPlanPage.css';

/**
 *
 *  Refactor needed!
 *
 *  Once an established style for the app
 *  is designed and event stages are outlined,
 *  update this component to refect the changes.
 *
 */
export default function EventPlanPage({
  match,
}: {
  match: {
    params: {
      id: string;
    };
  };
}): JSX.Element {
  const { userRecord } = useUserRecordContext();
  const eventPlanData = React.useRef<EventPlanDocument>();
  const [eventAvailability, setEventAvailability] =
    React.useState<EventPlanAvailabilityDocument>();
  const [heatMapData, setHeatMapData] = React.useState<HeatMapData>();
  const [scheduleSelectorData, setScheduleSelectorData] =
    React.useState<ScheduleSelectorData>();
  const isHost = isUserAHost(userRecord);

  React.useEffect(() => {
    if (userRecord) {
      const { uid, timeFormat } = userRecord;

      getDocSnapshot$(`/event-plans/${match.params.id}`, {
        next: (eventPlanSnapshot) => {
          const eventPlan = eventPlanSnapshot.data() as EventPlanDocument;
          eventPlanData.current = eventPlan;

          getAllSubCollDocsSnapshot$(
            `/event-plans/${match.params.id}/availabilities`,
            {
              next: (eventPlanAvailabilitiesSnapshot) => {
                if (!eventPlanAvailabilitiesSnapshot.empty) {
                  let eventPlanAvailabilities: EventPlanAvailabilityDocument[] =
                    [{ data: {} }];
                  let userEventPlanAvailability: EventPlanAvailabilityDocument =
                    { data: {} };
                  eventPlanAvailabilitiesSnapshot.forEach((doc) => {
                    getDocSnapshot$(
                      `event-plans/${match.params.id}/availabilities/${doc.id}`,
                      {
                        next: (eventPlanAvailabilitiesDocSnapshot) => {
                          if (eventPlanAvailabilitiesDocSnapshot.exists()) {
                            if (doc.id === uid) {
                              userEventPlanAvailability =
                                eventPlanAvailabilitiesDocSnapshot.data() as EventPlanAvailabilityDocument;
                            }
                            eventPlanAvailabilities.push(
                              eventPlanAvailabilitiesDocSnapshot.data() as EventPlanAvailabilityDocument
                            );
                          }
                        },
                      }
                    );
                  });

                  getDocSnapshot$(
                    `/users/${uid}/availabilities/schedule-selector`,
                    {
                      next: (scheduleSelectorDocSnapshot) => {
                        const { data: scheduleSelectorData } =
                          scheduleSelectorDocSnapshot.data() as {
                            data: number[];
                          };

                        const mergedEventPlanAvailabilities: EventPlanAvailabilityDocument =
                          mergeEventPlanAvailabilities(eventPlanAvailabilities);

                        const [
                          createdUserPlanAvailabilityDocument,
                          createdHeatMapData,
                          createdScheduleSelectorData,
                        ] = createHeatMapDataAndScheduleSelectorData(
                          eventPlan,
                          userEventPlanAvailability,
                          mergedEventPlanAvailabilities,
                          scheduleSelectorData ?? [],
                          timeFormat
                        );

                        setEventAvailability(
                          createdUserPlanAvailabilityDocument
                        );
                        setHeatMapData(createdHeatMapData);
                        setScheduleSelectorData(createdScheduleSelectorData);
                      },
                    }
                  );
                }
              },
            }
          );
        },
      });
    }
  }, [userRecord, match.params.id]);
  /**
   * Renders an event in the planning stage
   * Needs to be updated once a proper solution
   *  is developed
   *
   */

  if (
    heatMapData &&
    eventPlanData.current &&
    userRecord &&
    eventAvailability !== undefined &&
    scheduleSelectorData !== undefined
  ) {
    return (
      <Sidebar>
        <EventPlanning
          userId={userRecord.uid}
          eventPlanData={eventPlanData.current}
          eventPlanAvailability={eventAvailability}
          heatMapData={heatMapData}
          scheduleSelector={scheduleSelectorData}
          isHost={isHost}
        />
      </Sidebar>
    );
  }

  // default render
  return (
    <Sidebar>
      <></>
    </Sidebar>
  );
}
