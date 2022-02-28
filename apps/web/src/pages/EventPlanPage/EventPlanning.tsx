import React from 'react';
import { Row, Col, Container, Modal, Button } from 'react-bootstrap';
import AvailabilityHeatMap from '../../components/AvailabilityHeatMap/AvailabilityHeatMap';
import HeatMapData from '../../interfaces/HeatMapData';
import ScheduleSelectorData from '../../interfaces/ScheduleSelectorData';
import ConfirmEventModal from '../../components/ConfirmEventModal/ConfirmEventModal';
import { appendUserAvailabilityToGroupEventPlanAvailability } from '../../lib/availability';
import { updateEventAvailability } from '../../lib/firestore';
import AvailabilityScheduleSelector from '../../components/AvailabilityScheduleSelector/AvailabilityScheduleSelector';

import './EventPlanPage.css';
import { transformStartTime, transformEndTime } from '../../lib/eventHelpers';
import { EventPlanDocument } from 'wya-api/dist/interfaces';
import { EventDataAvailability } from '../../interfaces/EventData';

type AddAvailabilityModalProps = {
    scheduleSelectorData: ScheduleSelectorData;
    show: boolean;
    onHide: () => void;
    eventPlanAvailability: EventDataAvailability;
    eventPlanId: string;
    uid: string;
};

function AddAvailabilityModal({
    scheduleSelectorData,
    show,
    onHide,
    eventPlanAvailability: eventPlanAvailability,
    eventPlanId: eventPlanId,
    uid,
}: AddAvailabilityModalProps): JSX.Element {
    const {
        scheduleData,
        xDaysScheduleSelectorLabelsArray: sortedXData,
        xDaysFormattedToSlicedDateString: formattedXData,
        yTimesScheduleSelectorLabelsArray: sortedYData,
        hourlyTimeFormat: hourlyTimeFormat,
    } = scheduleSelectorData;

    const [userAvailabilityData, setUserAvailabilityData] =
        React.useState<Array<Date>>(scheduleData);

    const startTime = transformStartTime(sortedYData[0]);
    const endTime = transformEndTime(sortedYData[sortedYData.length - 1]);

    const onClickScheduleSelectorHandle = (newSchedule: Array<Date>) => {
        setUserAvailabilityData(newSchedule);
    };

    const onClickCancelHandle = () => {
        setUserAvailabilityData(scheduleData);
        return onHide ? onHide() : undefined;
    };

    const onSubmitHandler = () => {
        const newEventPlanAvailability =
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
                    hourlyTimeFormat={hourlyTimeFormat}
                />
            </Modal.Body>
            <Modal.Footer>
                <Button
                    variant="outline-secondary"
                    onClick={onClickCancelHandle}
                >
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
    eventPlanAvailability: EventDataAvailability;
    heatMapData: HeatMapData;
    scheduleSelector: ScheduleSelectorData;
    isHost: boolean;
}

export default function EventPlanning({
    userId,
    eventPlanData: eventPlanData,
    eventPlanAvailability: eventPlanAvailability,
    heatMapData,
    scheduleSelector,
    isHost,
}: EventPlanningProps): JSX.Element {
    const [modalShow, setModalShow] = React.useState<boolean>(false);

    return (
        <Container fluid id="eventPlanningContainer">
            <h1>{eventPlanData.name}</h1>
            <Col id="containerCol" sm={6}>
                <Row>
                    <div id="eventDetails">
                        <h2>Description</h2>
                        <p>{eventPlanData.description}</p>
                    </div>
                </Row>
                <h2>Group Availabilities</h2>
                <Row>
                    <AvailabilityHeatMap
                        yLabels={heatMapData.yTimesHeatMapLabelsArray}
                        xLabels={heatMapData.xDaysFormattedToSlicedDateString}
                        data={heatMapData.heatMap2dArray}
                        onClick={() => undefined}
                    />
                </Row>
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
                        {/* {isHost && !eventPlanData.isFinalized && (
                            <ConfirmEventModal
                                event={eventPlanData}
                                heatMapData={heatMapData}
                            />
                        )} */}
                    </div>
                </Row>
            </Col>
        </Container>
    );
}
