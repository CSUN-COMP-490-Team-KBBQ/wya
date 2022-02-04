import React from 'react';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Modal from 'react-bootstrap/Modal';
import ListGroup from 'react-bootstrap/ListGroup';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Container } from 'react-bootstrap';
import { v4 as uuid } from 'uuid';

import AvailabilityHeatMap from '../../components/AvailabilityHeatMap/AvailabilityHeatMap';
import Page from '../../components/Page/Page';
import EventData, { EventDataAvailability } from '../../interfaces/EventData';
import {
  getDocSnapshot$,
  updateEventAvailability,
  updateEvent,
  updateUserRecord,
} from '../../lib/firestore';
import HeatMapData from '../../interfaces/HeatMapData';
import ConfirmEventModal from '../../components/ConfirmEventModal/ConfirmEventModal';
import {
  getYTimesSorted,
  getXDaysSorted,
  formatXDays,
  createAvailabilityDataArray,
  createPreloadArray,
  cleanUpUserAvailability,
  formatYTimes,
} from '../../lib/availability';
import { useUserRecordContext } from '../../contexts/UserRecordContext';
import AvailabilityScheduleSelector from '../../components/AvailabilityScheduleSelector/AvailabilityScheduleSelector';
import ScheduleSelectorData from '../../interfaces/ScheduleSelectorData';

import './EventPage.css';
import UserData from '../../interfaces/User';

type AddAvailabilityModalProps = {
  scheduleSelectorData: ScheduleSelectorData;
  show: boolean;
  onHide: () => void;
  eventAvailability: EventDataAvailability;
  eventId: string;
  uid: string;
};

function appendUserAvailabilityToGroup(
  xDays: string[],
  yTimes: string[],
  eventAvailability: EventDataAvailability,
  userAvailability: Array<Date>,
  uid: string
): EventDataAvailability {
  cleanUpUserAvailability(userAvailability);

  // removes uid from each cell to start from scratch
  for (let i = 0; i < yTimes.length; i += 1) {
    for (let j = 0; j < xDays.length; j += 1) {
      if (eventAvailability[yTimes[i]][xDays[j]].includes(uid)) {
        const removeIndex = eventAvailability[yTimes[i]][xDays[j]].findIndex(
          (item) => {
            return item === uid;
          }
        );
        eventAvailability[yTimes[i]][xDays[j]].splice(removeIndex, 1);
      }
    }
  }

  // add uid to each appropriate cell
  for (let i = 0; i < userAvailability.length; i += 1) {
    const time = userAvailability[i].toTimeString().slice(0, 5);
    const temp = new Date(userAvailability[i].toDateString().slice(0, 15));
    const day = temp.getTime().toString();
    if (eventAvailability[time][day].includes(uid)) {
      // eslint-disable-next-line
      console.log('User already HERE');
    } else {
      eventAvailability[time][day].push(uid);
    }
  }

  return eventAvailability;
}

function AddAvailabilityModal({
  scheduleSelectorData,
  show,
  onHide,
  eventAvailability,
  eventId,
  uid,
}: AddAvailabilityModalProps): JSX.Element {
  const { scheduleData, sortedXData, formattedXData, sortedYData, is24Hour } =
    scheduleSelectorData;

  const [userAvailabilityData, setUserAvailabilityData] =
    React.useState<Array<Date>>(scheduleData);

  const onClickScheduleSelectorHandle = (newSchedule: Array<Date>) => {
    setUserAvailabilityData(newSchedule);
  };

  const onClickCancelHandle = () => {
    setUserAvailabilityData(scheduleData);
    return onHide ? onHide() : undefined;
  };

  const onSubmitHandler = () => {
    const newEventAvailability = appendUserAvailabilityToGroup(
      sortedXData,
      sortedYData,
      eventAvailability,
      userAvailabilityData,
      uid
    );
    updateEventAvailability(newEventAvailability, eventId)
      .then(() => {
        return onHide ? onHide() : undefined;
      })
      // eslint-disable-next-line
      .catch(console.error);
  };

  // add appropriate 15 minute increment to startTime
  const startTimeFormatted = (timeString: string): number => {
    const minutesString = timeString.slice(3, 5);
    const hoursNum = Number(timeString.slice(0, 2));

    if (minutesString === '15') {
      return hoursNum + 0.25;
    }
    if (minutesString === '30') {
      return hoursNum + 0.5;
    }
    if (minutesString === '45') {
      return hoursNum + 0.75;
    }

    return hoursNum;
  };

  // adds appropriate 15 minutes increment since endTime is rounded down
  const endTimeFormatted = (timeString: string): number => {
    const minutesString = timeString.slice(3, 5);
    const hoursNum = Number(timeString.slice(0, 2));

    if (minutesString === '15') {
      return hoursNum + 0.5;
    }
    if (minutesString === '30') {
      return hoursNum + 0.75;
    }
    if (minutesString === '45') {
      return hoursNum + 1.0;
    }

    return hoursNum + 0.25;
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
          startTime={startTimeFormatted(sortedYData[0])}
          endTime={endTimeFormatted(sortedYData[sortedYData.length - 1])}
          scheduleData={userAvailabilityData}
          dateFormat="ddd MMM DD YYYY"
          days={formattedXData.length}
          startDate={new Date(formattedXData[0])}
          handleChange={onClickScheduleSelectorHandle}
          is24Hour={is24Hour}
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

/**
 * Renders a final event
 * Needs to be updated once a proper solution
 *  is developed
 *
 */
interface EventFinalizedProps {
  event: EventData;
  user: UserData;
  isHost: boolean;
}

function EventFinalized({
  event,
  user,
  isHost,
}: EventFinalizedProps): JSX.Element {
  const { name, day, description, startTime, endTime, rsvp } = event;
  const { events, firstName, lastName } = user;
  const eventInUserRecord = events.find((e) => e.eventId === event.eventId)!;
  const { accepted, declined } = eventInUserRecord;

  const handleAccept = () => {
    eventInUserRecord.accepted = true;
    eventInUserRecord.declined = false;
    rsvp.push(`${firstName} ${lastName}`);

    updateUserRecord(user);
    updateEvent(event);
  };

  const handleDecline = () => {
    eventInUserRecord.accepted = false;
    eventInUserRecord.declined = true;
    updateUserRecord(user);
  };

  return (
    <div id="eventFinalizedContent">
      <h1>{name}</h1>
      <div id="eventFinalizedPs">
        <p>
          <u>Description</u>: {description}
        </p>
        {/* add who is hosting here? */}
        <p>
          <u>Day</u>: {day}
        </p>
        <p>
          <u>Starts</u>: {startTime}
        </p>
        <p>
          <u>Ends</u>: {endTime}
        </p>
      </div>
      {/* render for a guest only */}
      {!isHost && !accepted && !declined && (
        <div id="eventFinalizedButtons">
          <Button onClick={handleDecline} variant="danger">
            Decline
          </Button>
          <Button onClick={handleAccept} variant="success">
            Accept
          </Button>
        </div>
      )}
      {!isHost && declined && (
        <Alert variant="info">
          You have declined this event. Did you want to accept?
          <span>
            <Button
              variant="light"
              style={{ margin: '0px 10px' }}
              onClick={handleAccept}
            >
              Yes
            </Button>
          </span>
        </Alert>
      )}
      <div>
        <h2>Attending</h2>
        <ListGroup className="attending-list">
          {rsvp.map((guestName) => {
            // include key prop with unique key
            return <ListGroup.Item key={uuid()}>{guestName}</ListGroup.Item>;
          })}
        </ListGroup>
      </div>
    </div>
  );
}

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
  const [modalShow, setModalShow] = React.useState<boolean>(false);
  const [heatMapData, setHeatMapData] = React.useState<HeatMapData>();
  const [scheduleSelectorData, setScheduleSelectorData] =
    React.useState<ScheduleSelectorData>();

  /**
   * Checks for host to render finalize event button.
   * Needs to be updated once a proper solution
   *  is developed
   *
   */
  const isUserAHost = (): boolean => {
    if (!userRecord) return false;

    return userRecord.events.some(
      (e) => e.eventId === match.params.id && e.role === 'HOST'
    );
  };

  React.useEffect(() => {
    if (userRecord) {
      getDocSnapshot$(`/events/${match.params.id}`, {
        next: (eventSnapshot) => {
          const event = eventSnapshot.data() as EventData;
          eventInfo.current = event;
          const sortedYTimes = getYTimesSorted(event.availability);
          const formattedYTimes = formatYTimes(
            userRecord.timeFormat24Hr,
            sortedYTimes
          );
          const sortedXDays = getXDaysSorted(sortedYTimes, event.availability);
          const formattedXDays = formatXDays(sortedXDays);

          setHeatMapData({
            yData: formattedYTimes,
            xData: sortedXDays,
            xDataFormatted: formattedXDays,
            mapData: createAvailabilityDataArray(
              sortedYTimes,
              sortedXDays,
              event.availability
            ),
          });

          setScheduleSelectorData({
            scheduleData: createPreloadArray(
              sortedYTimes,
              formattedXDays,
              userRecord.availability
            ),
            sortedXData: sortedXDays,
            formattedXData: formattedXDays,
            sortedYData: sortedYTimes,
            formattedYData: formattedYTimes,
            is24Hour: userRecord.timeFormat24Hr,
          });
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
  const eventPlanning = (
    userId: string,
    event: EventData,
    heatMap: HeatMapData,
    scheduleSelector: ScheduleSelectorData
  ): JSX.Element => {
    return (
      <Container fluid id="eventPlanningContainer">
        <h1>{event.name}</h1>
        <Col id="containerCol" sm={6}>
          <Row>
            <div id="eventDetails">
              <h2>Description</h2>
              <p>{event.description}</p>
            </div>
          </Row>
          <h2>Group Availabilities</h2>
          <Row>
            <AvailabilityHeatMap
              yLabels={heatMap.yData}
              xLabels={heatMap.xDataFormatted}
              data={heatMap.mapData}
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
              {isUserAHost() && !event.isFinalized && (
                <ConfirmEventModal event={event} heatMapData={heatMap} />
              )}
            </div>
          </Row>
        </Col>

        <AddAvailabilityModal
          scheduleSelectorData={scheduleSelector}
          show={modalShow}
          onHide={() => setModalShow(false)}
          eventAvailability={event.availability}
          eventId={match.params.id}
          uid={userId}
        />
      </Container>
    );
  };

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
            isHost={isUserAHost()}
          />
        ) : (
          eventPlanning(
            userRecord.uid,
            eventInfo.current,
            heatMapData,
            scheduleSelectorData
          )
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
