import React from 'react';
import { Modal, Button } from 'react-bootstrap';

import AvailabilityHeatMap from '../../components/AvailabilityHeatMap/AvailabilityHeatMap';
import ConfirmEventModal from '../../components/ConfirmEventModal/ConfirmEventModal';
import AvailabilityScheduleSelector from '../../components/AvailabilityScheduleSelector/AvailabilityScheduleSelector';

import { appendUserAvailabilityToGroupEventPlanAvailability } from '../../lib/availability';
import { updateEventAvailability } from '../../lib/firestore';
import { transformStartTime, transformEndTime } from '../../lib/eventHelpers';
import {
  EventPlanAvailabilityDocument,
  EventPlanDocument,
  HeatMapData,
  ScheduleSelectorData,
} from '../../interfaces';

import './EventPlanPage.css';

type AddAvailabilityModalProps = {
  scheduleSelectorData: ScheduleSelectorData;
  show: boolean;
  onHide: () => void;
  eventPlanAvailability: EventPlanAvailabilityDocument;
  eventPlanId: string;
  uid: string;
};

function AddAvailabilityModal({
  scheduleSelectorData,
  show,
  onHide,
  eventPlanAvailability,
  eventPlanId,
  uid,
}: AddAvailabilityModalProps): JSX.Element {
  const {
    scheduleData,
    xDaysScheduleSelectorLabelsArray: sortedXData,
    xDaysFormattedToSlicedDateString: formattedXData,
    yTimesScheduleSelectorLabelsArray: sortedYData,
    timeFormat,
  } = scheduleSelectorData;

  const [userAvailabilityData, setUserAvailabilityData] =
    React.useState<Date[]>(scheduleData);

  const startTime = transformStartTime(sortedYData[0]);
  const endTime = transformEndTime(sortedYData[sortedYData.length - 1]);

  const onClickScheduleSelectorHandle = (newSchedule: Date[]) => {
    setUserAvailabilityData(newSchedule);
  };

  const onClickCancelHandle = () => {
    setUserAvailabilityData(scheduleData);
    return onHide ? onHide() : undefined;
  };

  const onSubmitHandler = () => {
    const newEventPlanAvailability: EventPlanAvailabilityDocument =
      appendUserAvailabilityToGroupEventPlanAvailability(
        sortedXData,
        sortedYData,
        eventPlanAvailability,
        userAvailabilityData,
        uid
      );
    updateEventAvailability(newEventPlanAvailability, eventPlanId, uid)
      .then(() => {
        return onHide ? onHide() : undefined;
      })
      // eslint-disable-next-line
      .catch(console.error);
  };

  return (
    <Modal
      show={show}
      onHide={onClickCancelHandle}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header>
        <Modal.Title>Select Availability</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <AvailabilityScheduleSelector
          startTime={startTime}
          endTime={endTime}
          scheduleData={userAvailabilityData}
          dateFormat="ddd MMM DD YYYY"
          days={formattedXData.length}
          startDate={new Date(formattedXData[0])}
          handleChange={onClickScheduleSelectorHandle}
          timeFormat={timeFormat}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onClickCancelHandle}>
          Cancel
        </Button>
        <Button onClick={onSubmitHandler} variant="outline-success">
          Submit
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

interface EventPlanningProps {
  userId: string;
  eventPlanData: EventPlanDocument;
  eventPlanAvailability: EventPlanAvailabilityDocument;
  heatMapData: HeatMapData;
  scheduleSelector: ScheduleSelectorData;
  isHost: boolean;
}

export default function EventPlanning({
  userId,
  eventPlanData,
  eventPlanAvailability,
  heatMapData,
  scheduleSelector,
  isHost,
}: EventPlanningProps): JSX.Element {
  const [modalShow, setModalShow] = React.useState<boolean>(false);

  return (
    <div
      id="eventPlanningContainer"
      className="text-left bg-white shadow overflow-hidden sm:rounded-lg"
    >
      <div id="eventDetails" className="mb-2 px-4 sm:px-6">
        <h3 className="text-left text-lg leading-6 font-medium text-gray-900">
          Event Plan Details
        </h3>
      </div>
      <div className="">
        <dl className="sm:divide-y sm:divide-gray-200">
          <div className="py-4 mt-6 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-left text-sm font-medium text-gray-500">
              Event Plan Name
            </dt>
            <dd className="text-left mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {eventPlanData.name}
            </dd>
          </div>
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-left text-sm font-medium text-gray-500">
              Event Plan Description
            </dt>
            <dd className="text-left mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {eventPlanData.description}
            </dd>
          </div>
          <div style={{ margin: '0rem 10rem 0rem 0rem' }}>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-left text-sm font-medium text-gray-500">
                Group Availability
              </dt>
              <dd className="text-left mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <AvailabilityHeatMap
                  yLabels={heatMapData.yTimesHeatMapLabelsArray}
                  xLabels={heatMapData.xDaysFormattedToSlicedDateString}
                  data={heatMapData.heatMap2dArray}
                  onClick={() => undefined}
                />
              </dd>
            </div>
            <div className="sm:mt-8 sm:flex justify-end">
              <div className="inline-flex rounded-md shadow">
                <Button
                  className="eventAddAvailabilityButton"
                  type="button"
                  onClick={() => setModalShow(true)}
                >
                  Add Availability
                </Button>
                <AddAvailabilityModal
                  scheduleSelectorData={scheduleSelector}
                  show={modalShow}
                  onHide={() => setModalShow(false)}
                  eventPlanAvailability={eventPlanAvailability}
                  eventPlanId={eventPlanData.eventPlanId}
                  uid={userId}
                />
                {isHost && (
                  <ConfirmEventModal
                    eventPlanDocument={eventPlanData}
                    heatMapData={heatMapData}
                  />
                )}
              </div>
            </div>
          </div>
        </dl>
      </div>
    </div>
  );
}
