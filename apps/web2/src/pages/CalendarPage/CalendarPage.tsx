import React from 'react';
import { Fragment } from 'react';
// import './CalendarPage.css';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Calendar from 'react-calendar';
import EventPlanList from '../../components/EventPlanList/EventPlanList';
import EventList from '../../components/FinalizedEventList/FinalizedEventList';
import Page from '../../components/Page/Page';
import AvailabilityScheduleSelector from '../../components/AvailabilityScheduleSelector/AvailabilityScheduleSelector';
import { Menu, Transition } from '@headlessui/react';
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

import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DotsHorizontalIcon,
  LocationMarkerIcon,
} from '@heroicons/react/solid';

import {
  EventPlanId,
  EventPlanInfo,
  EventId,
  EventInfo,
  ScheduleSelectorData,
} from '../../interfaces/';

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
    React.useState<Date[]>(scheduleData);

  const onClickScheduleSelectorHandle = (newSchedule: Date[]) => {
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
const days = [
  { date: '2021-12-27' },
  { date: '2021-12-28' },
  { date: '2021-12-29' },
  { date: '2021-12-30' },
  { date: '2021-12-31' },
  { date: '2022-01-01', isCurrentMonth: true },
  { date: '2022-01-02', isCurrentMonth: true },
  { date: '2022-01-03', isCurrentMonth: true },
  { date: '2022-01-04', isCurrentMonth: true },
  { date: '2022-01-05', isCurrentMonth: true },
  { date: '2022-01-06', isCurrentMonth: true },
  { date: '2022-01-07', isCurrentMonth: true },
  { date: '2022-01-08', isCurrentMonth: true },
  { date: '2022-01-09', isCurrentMonth: true },
  { date: '2022-01-10', isCurrentMonth: true },
  { date: '2022-01-11', isCurrentMonth: true },
  { date: '2022-01-12', isCurrentMonth: true, isToday: true },
  { date: '2022-01-13', isCurrentMonth: true },
  { date: '2022-01-14', isCurrentMonth: true },
  { date: '2022-01-15', isCurrentMonth: true },
  { date: '2022-01-16', isCurrentMonth: true },
  { date: '2022-01-17', isCurrentMonth: true },
  { date: '2022-01-18', isCurrentMonth: true },
  { date: '2022-01-19', isCurrentMonth: true },
  { date: '2022-01-20', isCurrentMonth: true },
  { date: '2022-01-21', isCurrentMonth: true },
  { date: '2022-01-22', isCurrentMonth: true, isSelected: true },
  { date: '2022-01-23', isCurrentMonth: true },
  { date: '2022-01-24', isCurrentMonth: true },
  { date: '2022-01-25', isCurrentMonth: true },
  { date: '2022-01-26', isCurrentMonth: true },
  { date: '2022-01-27', isCurrentMonth: true },
  { date: '2022-01-28', isCurrentMonth: true },
  { date: '2022-01-29', isCurrentMonth: true },
  { date: '2022-01-30', isCurrentMonth: true },
  { date: '2022-01-31', isCurrentMonth: true },
  { date: '2022-02-01' },
  { date: '2022-02-02' },
  { date: '2022-02-03' },
  { date: '2022-02-04' },
  { date: '2022-02-05' },
  { date: '2022-02-06' },
];
function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
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
  const [events, setEvents] = React.useState<
    Array<EventInfo & { eventId: EventId }>
  >([]);

  // Observe user availability
  React.useEffect(() => {
    if (userRecord) {
      const { uid } = userRecord;

      getDocSnapshot$(`/users/${uid}/availabilities/schedule-selector`, {
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
      });

      // begin geting eventPlanId from documentId from users/uid/event-plans/eventPlanId
      getAllSubCollDocsSnapshot$(`/users/${uid}/event-plans`, {
        next: (eventPlansSnapshot) => {
          if (!eventPlansSnapshot.empty) {
            const eventPlanInfoAndEventPlanId: Array<
              EventPlanInfo & { eventPlanId: EventPlanId }
            > = [];

            eventPlansSnapshot.forEach((doc) => {
              // now get document object by using eventPlanId
              getDocSnapshot$(`/users/${uid}/event-plans/${doc.id}`, {
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
              });
            });
          }
        },
      });

      // begin geting eventId from documentId from users/uid/event/eventId
      getAllSubCollDocsSnapshot$(`/users/${uid}/events`, {
        next: (eventsSnapshot) => {
          if (!eventsSnapshot.empty) {
            const eventInfoAndEventId: Array<EventInfo & { eventId: EventId }> =
              [];

            eventsSnapshot.forEach((doc) => {
              // now get document object by using eventId
              getDocSnapshot$(`/users/${uid}/events/${doc.id}`, {
                next: (eventDocSnapshot) => {
                  if (eventDocSnapshot.exists()) {
                    const eventInfo: EventInfo =
                      eventDocSnapshot.data() as EventInfo;

                    eventInfoAndEventId.push({
                      eventId: doc.id,
                      ...eventInfo,
                    });

                    if (eventInfoAndEventId.length === eventsSnapshot.size) {
                      setEvents(eventInfoAndEventId);
                    }
                  }
                },
              });
            });
          }
        },
      });
    }
  }, [userRecord]);

  // Observe user events

  return (
    <>
      {userRecord && scheduleSelectorData !== undefined ? (
        <>
          {/* 3 column wrapper */}
          <div className="flex-grow w-full max-w-full mx-auto xl:px-8 lg:flex bg-white">
            {/* main wrapper */}
            <div className="flex-1 min-w-0 bg-white lg:flex">
              <div className="bg-white lg:min-w-0 lg:flex-1">
                <div className="h-full py-6 px-4 sm:px-6 lg:px-8 bg-white">
                  {/* Start main area*/}
                  <div
                    className="relative h-full"
                    style={{ minHeight: '36rem' }}
                  >
                    <div className="absolute inset-0 border-2 border-gray-200 border-dashed rounded-lg overflow-y-auto bg-white">
                      <h1 className="pt-4 flex justify-center">Calendar</h1>
                      {/* Calendar */}
                      <div className="flex justify-center px-8">
                        <div className="mt-10 w-full text-center">
                          <div className="flex items-center text-gray-900">
                            <button
                              type="button"
                              className="-m-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
                            >
                              <span className="sr-only">Previous month</span>
                              <ChevronLeftIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                            </button>
                            <div className="flex-auto font-semibold">
                              January
                            </div>
                            <button
                              type="button"
                              className="-m-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
                            >
                              <span className="sr-only">Next month</span>
                              <ChevronRightIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                            </button>
                          </div>
                          <div className="mt-6 grid grid-cols-7 text-xs leading-6 text-gray-500">
                            <div>M</div>
                            <div>T</div>
                            <div>W</div>
                            <div>T</div>
                            <div>F</div>
                            <div>S</div>
                            <div>S</div>
                          </div>
                          <div className="isolate mt-2 grid grid-cols-7 gap-px rounded-lg bg-gray-200 text-sm shadow ring-1 ring-gray-200">
                            {days.map((day, dayIdx) => (
                              <button
                                key={day.date}
                                type="button"
                                className={classNames(
                                  'py-1.5 hover:bg-gray-100 focus:z-10',
                                  day.isCurrentMonth
                                    ? 'bg-white'
                                    : 'bg-gray-50',
                                  (day.isSelected || day.isToday) &&
                                    'font-semibold',
                                  day.isSelected && 'text-white',
                                  !day.isSelected &&
                                    day.isCurrentMonth &&
                                    !day.isToday &&
                                    'text-gray-900',
                                  !day.isSelected &&
                                    !day.isCurrentMonth &&
                                    !day.isToday &&
                                    'text-gray-400',
                                  day.isToday &&
                                    !day.isSelected &&
                                    'text-indigo-600',
                                  dayIdx === 0 && 'rounded-tl-lg',
                                  dayIdx === 6 && 'rounded-tr-lg',
                                  dayIdx === days.length - 7 && 'rounded-bl-lg',
                                  dayIdx === days.length - 1 && 'rounded-br-lg'
                                )}
                              >
                                <time
                                  dateTime={day.date}
                                  className={classNames(
                                    'mx-auto flex h-7 w-7 items-center justify-center rounded-full',
                                    day.isSelected &&
                                      day.isToday &&
                                      'bg-indigo-600',
                                    day.isSelected &&
                                      !day.isToday &&
                                      'bg-gray-900'
                                  )}
                                >
                                  {day.date.split('-').pop()!.replace(/^0/, '')}
                                </time>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      {/* Calendar End */}
                      {/* Main Area Divider */}
                      <div className="relative py-4">
                        <div
                          className="absolute inset-0 flex items-center"
                          aria-hidden="true"
                        >
                          <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center">
                          <span className="px-3 bg-white text-lg font-medium text-gray-900"></span>
                        </div>
                      </div>
                      {/* End Main Area Divider */}
                      <div className="pb-4">
                        <EventList
                          elementId="calendar-event-plan-list"
                          events={events}
                        />
                      </div>
                    </div>
                  </div>
                  {/* End main area */}
                </div>
              </div>
            </div>

            <div className="bg-[#00416d] pr-4 sm:pr-6 lg:pr-8 lg:flex-shrink-0 lg:border-l lg:border-gray-200 xl:pr-0">
              <div className="h-full pl-6 py-6 lg:w-80 bg-white">
                {/* Start right column area */}
                <div className="h-full relative" style={{ minHeight: '16rem' }}>
                  <div className="absolute inset-0 border-2 border-gray-200 border-dashed rounded-lg overflow-y-auto bg-white">
                    <div>
                      <EventPlanList elementId="" eventPlans={eventPlans} />
                    </div>
                  </div>
                </div>
                {/* End right column area */}
              </div>
            </div>
          </div>
        </>
      ) : (
        <></>
      )}
    </>
  );
}
