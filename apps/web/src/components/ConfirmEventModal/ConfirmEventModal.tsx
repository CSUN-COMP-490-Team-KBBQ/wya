import React from 'react';
import moment from 'moment';
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';
import Select from 'react-select';
import { useHistory } from 'react-router-dom';

import { EventPlanDocument, HeatMapData } from '../../interfaces';
import { convertStringArrayToObjectWithValueAndLabel } from '../../lib/eventHelpers';

import './ConfirmEventModal.css';
import api from '../../modules/api';

import { TIME_FORMAT, SUPPORTED_TIME_FORMATS } from '../../interfaces';

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
    const startTime24hr = moment(startTime, SUPPORTED_TIME_FORMATS).format(
      TIME_FORMAT.TWENTY_FOUR_HOURS
    );
    const endTime24hr = moment(endTime, SUPPORTED_TIME_FORMATS).format(
      TIME_FORMAT.TWENTY_FOUR_HOURS
    );

    if (day && startTime && endTime) {
      if (startTime24hr >= endTime24hr) {
        setDisplayError('The start time must be less than the end time!');
      } else {
        const {
          data: {
            data: [eventId],
          },
        } = await api.post(
          '/events/create',
          JSON.stringify({ eventPlanId: eventPlanDocument.eventPlanId, day })
        );

        console.log('Event finalized: ', eventId);
        history.push(`/events/${eventId}`);
      }
    } else {
      setDisplayError('All values need to be entered to update event!');
    }
  };

  return (
    <div>
      <button
        type="button"
        className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        onClick={handleShow}
      >
        Confirm Event
      </button>

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
          <button
            className="hover:bg-gray-500 text-gray-500 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
            onClick={handleClose}
          >
            Cancel
          </button>
          <button
            className="hover:bg-blue-500 text-blue-500 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
            onClick={onSubmitHandler}
          >
            Finalize Event
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
