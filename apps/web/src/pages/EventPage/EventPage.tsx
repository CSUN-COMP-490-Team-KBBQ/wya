import React from 'react';
import Page from '../../components/Page/Page';
import EventData from '../../interfaces/EventData';
import { getDocSnapshot$ } from '../../lib/firestore';
import HeatMapData from '../../interfaces/HeatMapData';
import { createHeatMapDataAndScheduleSelectorData } from '../../lib/availability';
import { useUserRecordContext } from '../../contexts/UserRecordContext';
import ScheduleSelectorData from '../../interfaces/ScheduleSelectorData';
import EventPlanning from './EventPlanning/EventPlanning';

import './EventPage.css';
import { isUserAHost } from '../../lib/eventHelpers';

/**
 *
 *  Refactor needed!
 *
 *  Once an established style for the app
 *  is designed and event stages are outlined,
 *  update this component to refect the changes.
 *
 */
export default function EventPage({
  match,
}: {
  match: {
    params: {
      id: string;
    };
  };
}): JSX.Element {
  const { userRecord } = useUserRecordContext();
  const eventInfo = React.useRef<EventData>();
  const [heatMapData, setHeatMapData] = React.useState<HeatMapData>();
  const [scheduleSelectorData, setScheduleSelectorData] =
    React.useState<ScheduleSelectorData>();
  const isHost = isUserAHost(userRecord);

  React.useEffect(() => {
    if (userRecord) {
      getDocSnapshot$(`/${process.env.REACT_APP_EVENTS}/${match.params.id}`, {
        next: (eventSnapshot) => {
          const event = eventSnapshot.data() as EventData;
          eventInfo.current = event;
          const [createdHeatMapData, createdScheduleSelectorData] =
            createHeatMapDataAndScheduleSelectorData(
              event.availability,
              // TODO: Extract user availability
              [],
              // TODO: Use hourlyTimeFormat
              false
            );

          setHeatMapData(createdHeatMapData);
          setScheduleSelectorData(createdScheduleSelectorData);
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
    eventInfo.current &&
    userRecord &&
    scheduleSelectorData !== undefined
  ) {
    return (
      <Page>
        <EventPlanning
          userId={userRecord.uid}
          eventData={eventInfo.current}
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
