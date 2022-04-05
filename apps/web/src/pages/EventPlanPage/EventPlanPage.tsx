import React from 'react';
import Page from '../../components/Page/Page';
import {
  EventPlanAvailabilityDocument,
  HeatMapData,
} from '../../interfaces/index';
import { getDocSnapshot$, getSubCollDocSnapshot$ } from '../../lib/firestore';
import { createHeatMapDataAndScheduleSelectorData } from '../../lib/availability';
import { useUserRecordContext } from '../../contexts/UserRecordContext';
import EventPlanning from './EventPlanning';

import { isUserAHost } from '../../lib/eventHelpers';
import {
  EventPlanDocument,
  ScheduleSelectorData,
} from '../../interfaces/index';

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

          getSubCollDocSnapshot$(
            `/event-plans/${match.params.id}/availabilities/${uid}`,
            {
              next: (eventPlanAvailabilitiesSnapshot) => {
                getDocSnapshot$(
                  `/users/${uid}/availabilities/schedule-selector`,
                  {
                    next: (scheduleSelectorDocSnapshot) => {
                      const { data: scheduleSelectorData } =
                        scheduleSelectorDocSnapshot.data() as {
                          data: number[];
                        };

                      const eventPlanAvailabilitiesDocument =
                        eventPlanAvailabilitiesSnapshot.data() as EventPlanAvailabilityDocument;
                      eventPlanData.current = eventPlan;

                      const [
                        createdEventAvailability,
                        createdHeatMapData,
                        createdScheduleSelectorData,
                      ] = createHeatMapDataAndScheduleSelectorData(
                        eventPlan,
                        // TODO: Extract event availabilities from every user
                        eventPlanAvailabilitiesDocument,
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
