import moment from 'moment';
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
  timeFormat: string;
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
    timeFormat,
  } = props;

  const handleRenderDateCell = (
    time: Date, // being used internally, somehow -Jorge (laughed after I literally put what he said)
    selected: boolean,
    refSetter: (dateCell: HTMLElement | null) => void
  ) => {
    const currentTime = time.getHours() + time.getMinutes() / 60;
    const selectionId = selected ? 'selectedCell' : 'unSelectedCell';
    if (startTime === 0) {
      if (currentTime < endTime) {
        return <div id={selectionId} ref={refSetter} />;
      }

      return <div />;
    }
    if (currentTime < endTime && Math.floor(currentTime) !== 0) {
      return <div id={selectionId} ref={refSetter} />;
    }

    return <div />;
  };

  const handleRenderTimeLabel = (time: Date) => {
    const timeLabel = moment(time).format(timeFormat);
    const currentTime = time.getHours() + time.getMinutes() / 60;

    // if with-in timespan
    if (currentTime < endTime) {
      return <div id="yLabel">{`${timeLabel}`}</div>;
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
