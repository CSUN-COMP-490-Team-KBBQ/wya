import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Select from 'react-select';
import { useHistory } from 'react-router-dom';

import {
  EventInfo,
  EventPlanDocument,
  EventPlanId,
  HeatMapData,
} from '../../interfaces';
import { createEventFinalized } from '../../lib/firestore';
import { convertStringArrayToObjectWithValueAndLabel } from '../../lib/eventHelpers';

import './ConfirmEventModal.css';

type UserId = string;

interface ConfirmEventModalProps {
  eventPlanDocument: EventPlanDocument;
  heatMapData: HeatMapData;
}

export default function ConfirmEventModal(
  props: ConfirmEventModalProps
): JSX.Element {
  const history = useHistory();
  const [show, setShow] = React.useState<boolean>(false);
  const [displayError, setDisplayError] = React.useState<string>('');
  const { eventPlanDocument, heatMapData } = props;
  const {
    yTimesHeatMapLabelsArray: yTimesHeatMapLabelArray,
    xDaysFormattedToSlicedDateString,
  } = heatMapData;

  // prepping Select component options
  const dayOptions = convertStringArrayToObjectWithValueAndLabel(
    xDaysFormattedToSlicedDateString
  );
  const startTimeOptions = convertStringArrayToObjectWithValueAndLabel(
    yTimesHeatMapLabelArray
  );
  const endTimeOptions = convertStringArrayToObjectWithValueAndLabel(
    yTimesHeatMapLabelArray
  );

  // removes the last option for the start time options since we need at least 15 minutes of time
  startTimeOptions.pop();
  // removes the first optins for the end time options since we need at least 15 minutes of time
  endTimeOptions.shift();

  // defining Select component onChange values
  const [day, setDay] = React.useState<string>();
  const [startTime, setStartTime] = React.useState<string>();
  const [endTime, setEndTime] = React.useState<string>();

  // defining modal visability handlers
  const handleClose = () => {
    setDisplayError('');
    setShow(false);
  };
  const handleShow = () => setShow(true);

  const onSubmitHandler = async () => {
    if (day && startTime && endTime) {
      if (startTime >= endTime) {
        setDisplayError('The start time must be less than the end time!');
      } else {
        const { eventPlanId, ...restOfParams } = eventPlanDocument;

        const newEventData: EventInfo & { eventPlanId: EventPlanId } & {
          inviteesByUserId: UserId[];
        } = {
          day,
          eventPlanId,
          ...restOfParams,
        };

        const eventId = await createEventFinalized(newEventData);

        console.log('Event finalized: ', eventId);
        history.push(`/events-finalized/${eventId}`);
      }
    } else {
      setDisplayError('All values need to be entered to update event!');
    }
  };

  return (
    <div>
      <Button id="confirmButton" type="button" onClick={handleShow}>
        Confirm Event
      </Button>

      <Modal
        show={show}
        onHide={handleClose}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header>
          <Modal.Title id="contained-modal-title-vcenter">
            Confirm Event
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <h2>{eventPlanDocument.name.toUpperCase()}</h2>
            <h5>Description</h5>
            <p>{eventPlanDocument.description}</p>
            {/* <h5>Guests</h5>
                        <p>guest list</p> */}
            <h5>Date</h5>
            {displayError.length > 0 && (
              <Alert id="displayError" variant="danger">
                {displayError}
              </Alert>
            )}
            <Select
              className="confirm-event-options"
              options={dayOptions}
              isSearchable={false}
              placeholder="Day"
              onChange={(opt) => setDay(opt!.value)}
            />
            <Select
              className="confirm-event-options"
              options={startTimeOptions}
              isSearchable={false}
              placeholder="Starts"
              onChange={(opt) => setStartTime(opt!.value)}
            />
            <Select
              className="confirm-event-options"
              options={endTimeOptions}
              isSearchable={false}
              placeholder="Ends"
              onChange={(opt) => setEndTime(opt!.value)}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            id="confirmEventUpdateButton"
            onClick={onSubmitHandler}
            variant="outline-success"
          >
            Finalize Event
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
