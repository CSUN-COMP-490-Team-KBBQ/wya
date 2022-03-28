import React from 'react';
import './CalendarPage.css';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Calendar from 'react-calendar';
import EventPlanList from '../../components/EventPlanList/EventPlanList';
import Page from '../../components/Page/Page';
import AvailabilityScheduleSelector from '../../components/AvailabilityScheduleSelector/AvailabilityScheduleSelector';
import { useUserRecordContext } from '../../contexts/UserRecordContext';

import {
  getDocSnapshot$,
  getAllSubCollDocsSnapshot$,
  updateCalendarAvailability,
} from '../../lib/firestore';

import {
  convertUserAvailabilityDateArrayToTimestampArray,
  createScheduleSelectorData,
} from '../../lib/availability';

import ScheduleSelectorData from '../../interfaces/ScheduleSelectorData';
import { EventPlanId, EventPlanInfo } from '../../interfaces';

type UpdateAvailabilityModalProps = {
  uid: string;
  show: boolean;
  scheduleSelectorData: ScheduleSelectorData;
  onHide: React.MouseEventHandler<HTMLButtonElement> | undefined;
};

function UpdateAvailabilityModal({
  uid,
  scheduleSelectorData,
  show,
  onHide,
}: UpdateAvailabilityModalProps): JSX.Element {
  const { scheduleData, timeFormat: is24Hour } = scheduleSelectorData;

  const [userAvailabilityData, setUserAvailabilityData] =
    React.useState<Array<Date>>(scheduleData);

  const onClickScheduleSelectorHandle = (newSchedule: Array<Date>) => {
    setUserAvailabilityData(newSchedule);
  };

  const onClickClearHandle = () => {
    setUserAvailabilityData([]);
  };

  const onClickResetHandle = () => {
    setUserAvailabilityData(scheduleData);
  };

  const onClickCancelHandle = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    setUserAvailabilityData(scheduleData);
    return onHide ? onHide(e) : undefined;
  };

  const onClickUpdateHandle = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    // converting to array number for firestore upload
    const convertedUserAvailabilityData =
      convertUserAvailabilityDateArrayToTimestampArray(userAvailabilityData);

    updateCalendarAvailability(convertedUserAvailabilityData, uid)
      .then(() => {
        return onHide ? onHide(e) : undefined;
      })
      // eslint-disable-next-line
      .catch(console.error);
  };

  return (
    <Modal
      show={show}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header>
        <Modal.Title>Enter Your Availability</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <AvailabilityScheduleSelector
          startTime={0}
          endTime={24}
          scheduleData={userAvailabilityData}
          dateFormat="dddd"
          days={7}
          startDate={new Date('January 04, 1970')}
          handleChange={onClickScheduleSelectorHandle}
          timeFormat={is24Hour}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onClickResetHandle} variant="outline-info">
          Reset
        </Button>
        <Button onClick={onClickClearHandle} variant="outline-primary">
          Clear
        </Button>
        <Button variant="outline-secondary" onClick={onClickCancelHandle}>
          Cancel
        </Button>
        <Button onClick={onClickUpdateHandle} variant="outline-success">
          Update
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default function CalendarPage(): JSX.Element {
  const { userRecord } = useUserRecordContext();

  const [value, onChange] = React.useState(new Date());
  const [modalShow, setModalShow] = React.useState<boolean>(false);
  const [scheduleSelectorData, setScheduleSelectorData] =
    React.useState<ScheduleSelectorData>();
  const [eventPlans, setEventPlans] = React.useState<
    Array<EventPlanInfo & { eventPlanId: EventPlanId }>
  >([]);

  // Observe user availability
  React.useEffect(() => {
    if (userRecord) {
      const { uid } = userRecord;

      getDocSnapshot$(
        `/${process.env.REACT_APP_USERS}/${uid}/${process.env.REACT_APP_USER_SCHEDULE_SELECTOR_AVAILABILITY}`,
        {
          next: (scheduleSelectorDocSnapshot) => {
            if (scheduleSelectorDocSnapshot.exists()) {
              const { data: scheduleSelectorAvailability } =
                scheduleSelectorDocSnapshot.data();

              setScheduleSelectorData(
                createScheduleSelectorData(
                  scheduleSelectorAvailability ?? [],
                  userRecord.timeFormat
                )
              );
            }
          },
        }
      );

      // begin geting eventPlanId from documentId from users/uid/event-plans/eventPlanId
      getAllSubCollDocsSnapshot$(
        `/${process.env.REACT_APP_USERS}/${uid}/${process.env.REACT_APP_USER_EVENT_PLANS}`,
        {
          next: (eventPlansSnapshot) => {
            if (!eventPlansSnapshot.empty) {
              const eventPlanInfoAndEventPlanId: Array<
                EventPlanInfo & { eventPlanId: EventPlanId }
              > = [];

              eventPlansSnapshot.forEach((doc) => {
                // now get document object by using eventPlanId
                getDocSnapshot$(
                  `/${process.env.REACT_APP_USERS}/${uid}/${process.env.REACT_APP_USER_EVENT_PLANS}/${doc.id}`,
                  {
                    next: (eventPlanDocSnapshot) => {
                      if (eventPlanDocSnapshot.exists()) {
                        const eventPlanInfo: EventPlanInfo =
                          eventPlanDocSnapshot.data() as EventPlanInfo;

                        eventPlanInfoAndEventPlanId.push({
                          eventPlanId: doc.id,
                          ...eventPlanInfo,
                        });

                        if (
                          eventPlanInfoAndEventPlanId.length ===
                          eventPlansSnapshot.size
                        ) {
                          setEventPlans(eventPlanInfoAndEventPlanId);
                        }
                      }
                    },
                  }
                );
              });
            }
          },
        }
      );
    }
  }, [userRecord]);

  // Observe user events

  return (
    <Page>
      {userRecord && scheduleSelectorData !== undefined ? (
        <Container fluid id="calendarContainer">
          <Row>
            <Col sm={6} id="calendarCol">
              <div className="calendar-display">
                <h1>Calendar</h1>
                <Calendar
                  onChange={onChange}
                  value={value}
                  calendarType="US"
                  // onDayClick
                  // showDoubleView
                />
                <Button
                  type="button"
                  onClick={() => setModalShow(true)}
                  className="calendarAddAvailabilityButton"
                >
                  Edit Availability
                </Button>
                <UpdateAvailabilityModal
                  uid={userRecord.uid}
                  scheduleSelectorData={scheduleSelectorData}
                  show={modalShow}
                  onHide={() => setModalShow(false)}
                />
              </div>
            </Col>
            <Col sm={6} id="eventListCol">
              <EventPlanList
                elementId="calendar-event-plan-list"
                eventPlans={eventPlans}
              />
            </Col>
          </Row>
        </Container>
      ) : (
        <></>
      )}
    </Page>
  );
}
