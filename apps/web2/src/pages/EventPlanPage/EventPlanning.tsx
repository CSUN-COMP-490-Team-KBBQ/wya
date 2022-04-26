import React from 'react';
import { Row, Col, Container, Modal, Button } from 'react-bootstrap';

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
    <Container fluid id="eventPlanningContainer">
      <br></br>
      <h1 className="font-medium text-5xl mt-0 mb-2 text-black-600">{eventPlanData.name}</h1>
      <Col id="containerCol" sm={6}>
        <Row>
          <div id="eventDetails">
          <h3 className="font-medium italic text-lg mt-0 mb-2 text-black-600">{eventPlanData.description}</h3>
          </div>
        </Row>
        <br></br>
        <h3 className="font-medium italic text-5xl mt-0 mb-2 text-black-600">Group Availability</h3>
        <Row>
          <AvailabilityHeatMap
            yLabels={heatMapData.yTimesHeatMapLabelsArray}
            xLabels={heatMapData.xDaysFormattedToSlicedDateString}
            data={heatMapData.heatMap2dArray}
            onClick={() => undefined}
          />
        </Row>
        <br></br>
        <Row>
          <div id="buttonsRow">
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
        </Row>
        <br></br>
      </Col>
    </Container>
  );
}
