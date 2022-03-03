import React from 'react';
import Page from '../../components/Page/Page';
import {
  /*EventData,*/ EventDataAvailability,
} from '../../interfaces/EventData';
import { getDocSnapshot$, getSubCollDocSnapshot$ } from '../../lib/firestore';
import HeatMapData from '../../interfaces/HeatMapData';
import { createHeatMapDataAndScheduleSelectorData } from '../../lib/availability';
import { useUserRecordContext } from '../../contexts/UserRecordContext';
import ScheduleSelectorData from '../../interfaces/ScheduleSelectorData';
import EventPlanning from './EventPlanning';

import './EventPlanPage.css';
import { isUserAHost } from '../../lib/eventHelpers';
import { EventPlanDocument } from 'wya-api/dist/interfaces';

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
      getDocSnapshot$(
        `/${process.env.REACT_APP_EVENT_PLANS}/${match.params.id}`,
        {
          next: (eventPlanSnapshot) => {
            const eventPlan = eventPlanSnapshot.data() as EventPlanDocument;

            getSubCollDocSnapshot$(
              `/${process.env.REACT_APP_EVENT_PLANS}/${match.params.id}/${process.env.REACT_APP_EVENT_PLAN_AVAILABILITIES}/${userRecord.uid}`,
              {
                next: (eventPlanAvailabilitiesSnapshot) => {
                  const eventPlanAvailabilities =
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
                    // TODO: Extract event availabilities
                    eventPlanAvailabilities.data,
                    // TODO: Extract user availability
                    [],
                    userRecord.timeFormat
                  );

                  console.log(createdEventAvailability);

                  setEventAvailability(createdEventAvailability);
                  setHeatMapData(createdHeatMapData);
                  setScheduleSelectorData(createdScheduleSelectorData);
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
