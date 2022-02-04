import React from 'react';
import ScheduleSelector from 'react-schedule-selector';

import './AvailabilityScheduleSelector.css';

type AvailabilityScheduleSelectorProps = {
    startTime: number;
    endTime: number;
    scheduleData: Date[];
    dateFormat: string;
    days: number;
    startDate: Date;
    handleChange: (newSchedule: Date[]) => void;
    is24Hour: boolean;
};

function AvailabilityScheduleSelector(
    props: AvailabilityScheduleSelectorProps
): JSX.Element {
    const {
        startTime,
        endTime,
        scheduleData,
        dateFormat,
        days,
        startDate,
        handleChange,
        is24Hour,
    } = props;

    const handleRenderDateCell = (
        time: Date, // being used internally, somehow -Jorge (laughed after I literally put what he said)
        selected: boolean,
        refSetter: (dateCell: HTMLElement | null) => void
    ) => {
        const selectionId = selected ? 'selectedCell' : 'unSelectedCell';

        return <div id={selectionId} ref={refSetter} />;
    };

    const handleRenderTimeLabel = (time: Date) => {
        const timeLabel = time.toTimeString().slice(0, 5);
        const currentTime = time.getHours() + time.getMinutes() / 60;
        const timeHoursNum = Number(timeLabel.slice(0, 2));
        let timeMinutesNum = Number(timeLabel.slice(3, 5)).toString();

        if (timeMinutesNum === '0') {
            timeMinutesNum = '00';
        }

        // if with-in timespan
        if (currentTime < endTime) {
            if (is24Hour) {
                return <div id="yLabel">{`${timeLabel}`}</div>;
            }
            // if before noon
            if (timeHoursNum < 12) {
                return timeHoursNum === 0 ? ( // if mid-night, add 12 to make appropriate 12
                    <div id="yLabel">{`${
                        timeHoursNum + 12
                    }:${timeMinutesNum} am`}</div>
                ) : (
                    // else leave as is
                    <div id="yLabel">{`${timeHoursNum}:${timeMinutesNum} am`}</div>
                );
            }

            // else after noon
            return timeHoursNum === 12 ? ( // if noon, leave as 12
                <div id="yLabel">{`${timeHoursNum}:${timeMinutesNum} pm`}</div>
            ) : (
                // else, subtract 12 to make appropriate afternoon time
                <div id="yLabel">{`${
                    timeHoursNum - 12
                }:${timeMinutesNum} pm`}</div>
            );
        }

        return <div />;
    };

    return (
        <div id="scheduleSelectorWrapper">
            <ScheduleSelector
                selection={scheduleData}
                numDays={days}
                startDate={startDate}
                dateFormat={dateFormat}
                minTime={startTime}
                maxTime={endTime}
                hourlyChunks={4}
                onChange={handleChange}
                renderDateCell={handleRenderDateCell}
                renderTimeLabel={handleRenderTimeLabel}
            />
        </div>
    );
}

export default AvailabilityScheduleSelector;
