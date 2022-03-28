import React from 'react';
import Page from '../../components/Page/Page';
import { EventDataAvailability } from '../../interfaces/EventData';
import { getDocSnapshot$, getSubCollDocSnapshot$ } from '../../lib/firestore';
import HeatMapData from '../../interfaces/HeatMapData';
import ScheduleSelectorData from '../../interfaces/ScheduleSelectorData';
import { createHeatMapDataAndScheduleSelectorData } from '../../lib/availability';
import { useUserRecordContext } from '../../contexts/UserRecordContext';
import EventPlanning from './EventPlanning';

import { isUserAHost } from '../../lib/eventHelpers';
import { EventPlanDocument } from '../../interfaces';

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
    React.useState<EventDataAvailability>();
  const [heatMapData, setHeatMapData] = React.useState<HeatMapData>();
  const [scheduleSelectorData, setScheduleSelectorData] =
    React.useState<ScheduleSelectorData>();
  const isHost = isUserAHost(userRecord);

  React.useEffect(() => {
    if (userRecord) {
      const { uid, timeFormat } = userRecord;

      getDocSnapshot$(
        `/${process.env.REACT_APP_EVENT_PLANS}/${match.params.id}`,
        {
          next: (eventPlanSnapshot) => {
            const eventPlan = eventPlanSnapshot.data() as EventPlanDocument;

            getSubCollDocSnapshot$(
              `/${process.env.REACT_APP_EVENT_PLANS}/${match.params.id}/${process.env.REACT_APP_EVENT_PLAN_AVAILABILITIES}/${uid}`,
              {
                next: (eventPlanAvailabilitiesSnapshot) => {
                  getDocSnapshot$(
                    `/${process.env.REACT_APP_USERS}/${uid}/${process.env.REACT_APP_USER_SCHEDULE_SELECTOR_AVAILABILITY}`,
                    {
                      next: (scheduleSelectorDocSnapshot) => {
                        const { data: scheduleSelectorData } =
                          scheduleSelectorDocSnapshot.data() as {
                            data: number[];
                          };

                        const { data: eventPlanAvailabilities } =
                          eventPlanAvailabilitiesSnapshot.data() as {
                            data: EventDataAvailability;
                          };

                        eventPlanData.current = eventPlan;

                        const [
                          createdEventAvailability,
                          createdHeatMapData,
                          createdScheduleSelectorData,
                        ] = createHeatMapDataAndScheduleSelectorData(
                          eventPlan,
                          // TODO: Extract event availabilities from every user
                          eventPlanAvailabilities,
                          scheduleSelectorData ?? [],
                          timeFormat
                        );

                        setEventAvailability(createdEventAvailability);
                        setHeatMapData(createdHeatMapData);
                        setScheduleSelectorData(createdScheduleSelectorData);
                      },
                    }
                  );
                },
              }
            );
          },
        }
      );
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
      <Page>
        <EventPlanning
          userId={userRecord.uid}
          eventPlanData={eventPlanData.current}
          eventPlanAvailability={eventAvailability}
          heatMapData={heatMapData}
          scheduleSelector={scheduleSelectorData}
          isHost={isHost}
        />
      </Page>
    );
  }

  // default render
  return (
    <Page>
      <></>
    </Page>
  );
}
