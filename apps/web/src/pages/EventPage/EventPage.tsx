import React from 'react';
import Page from '../../components/Page/Page';
import EventData, { EventDataAvailability } from '../../interfaces/EventData';
import { getDocSnapshot$ } from '../../lib/firestore';
import HeatMapData from '../../interfaces/HeatMapData';
import { getHeatMapAndScheduleSelectorData } from '../../lib/availability';
import { useUserRecordContext } from '../../contexts/UserRecordContext';
import ScheduleSelectorData from '../../interfaces/ScheduleSelectorData';
import EventFinalized from './EventFinalized/EventFinalized';
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
    const isHost = isUserAHost(userRecord, match.params.id);

    React.useEffect(() => {
        if (userRecord) {
            getDocSnapshot$(`/events/${match.params.id}`, {
                next: (eventSnapshot) => {
                    const event = eventSnapshot.data() as EventData;
                    eventInfo.current = event;
                    const [heatMap, scheduleSelector] =
                        getHeatMapAndScheduleSelectorData(
                            event.availability,
                            userRecord.availability,
                            userRecord.timeFormat24Hr
                        );

                    setHeatMapData(heatMap);
                    setScheduleSelectorData(scheduleSelector);
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
                {eventInfo.current.isFinalized ? (
                    <EventFinalized
                        event={eventInfo.current}
                        user={userRecord}
                        isHost={isHost}
                    />
                ) : (
                    <EventPlanning
                        userId={userRecord.uid}
                        event={eventInfo.current}
                        heatMap={heatMapData}
                        scheduleSelector={scheduleSelectorData}
                        isHost={isHost}
                    />
                )}
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
