import React from 'react';
import moment from 'moment';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';

import {
  EventDocument,
  EventGuest,
  EVENT_GUEST_STATUS,
} from '../../interfaces';
import {
  getDocSnapshot$,
  getAllSubCollDocsSnapshot$,
} from '../../lib/firestore';
import { useUserRecordContext } from '../../contexts/UserRecordContext';

import api from '../../modules/api';
import Sidebar from '../../components/Sidebar/Sidebar';

export default function EventPage({
  match,
}: {
  match: {
    params: {
      id: string;
    };
  };
}): JSX.Element {
  const history = useHistory();
  const { userRecord } = useUserRecordContext();
  const [eventData, setEventData] = useState<EventDocument>();
  const [eventGuests, setEventGuests] = useState<EventGuest[]>([]);
  const [startTimeLabel, setStartTimeLabel] = useState<String>('');
  const [endTimeLabel, setEndTimeLabel] = useState<String>('');

  React.useEffect(() => {
    console.log('rendered - react use effect');
    if (userRecord) {
      // collect information from event which was finalized
      getDocSnapshot$(`/events/${match.params.id}`, {
        next: (eventSnapshot) => {
          const event = eventSnapshot.data() as EventDocument;

          // collect guests from finalized event
          getAllSubCollDocsSnapshot$(`/events/${match.params.id}/guests`, {
            next: (eventGuestsSnapshot) => {
              if (!eventGuestsSnapshot.empty) {
                let guests: EventGuest[] = [];

                eventGuestsSnapshot.forEach((doc) => {
                  // get guest using document id
                  getDocSnapshot$(
                    `/events/${match.params.id}/guests/${doc.id}`,
                    {
                      next: (eventGuestDocSnapshot) => {
                        if (eventGuestDocSnapshot.exists()) {
                          const eventGuestInfo: EventGuest =
                            eventGuestDocSnapshot.data() as EventGuest;

                          guests.push({
                            ...eventGuestInfo,
                            uid: doc.id,
                          });

                          // only update eventGuests once all have been added to guests
                          if (guests.length === eventGuestsSnapshot.size) {
                            setEventGuests(guests);
                          }
                        }
                      },
                    }
                  );
                });
              }
            },
          });

          setEventData(event);
          setStartTimeLabel(
            moment(event.dailyStartTime, 'HH').format(userRecord.timeFormat)
          );
          setEndTimeLabel(
            moment(event.dailyEndTime, 'HH').format(userRecord.timeFormat)
          );
        },
      });
    }
  }, [userRecord, match.params.id]);

  const handleAccept = async () => {
    if (userRecord) {
      const user: EventGuest = eventGuests.find(
        (obj) => obj.uid === userRecord.uid
      ) as EventGuest;
      user.status = EVENT_GUEST_STATUS.ACCEPTED;

      await api.post('/events/guests/update-status', {
        status: user.status,
        eventId: match.params.id,
      });
    }
  };

  const handleDecline = async () => {
    if (userRecord) {
      const user: EventGuest = eventGuests.find(
        (obj) => obj.uid === userRecord.uid
      ) as EventGuest;
      user.status = EVENT_GUEST_STATUS.DECLINED;

      await api.post('/events/guests/update-status', {
        status: user.status,
        eventId: match.params.id,
      });
    }
  };

  // api calls

  const handleDelete = async () => {
    if (eventData !== undefined && userRecord) {
      await api.post(
        '/events/delete',
        JSON.stringify({ eventId: eventData.eventId })
      );

      console.log('Event deleted');
      history.push('/dashboard');
    }
  };

  const handleRemove = async () => {
    if (eventData !== undefined && userRecord) {
      await api.post('/events/guests/delete', { eventId: eventData.eventId });

      console.log('Event Guest removed');
      history.push('/dashboard');
    }
  };

  if (userRecord && eventData && eventGuests) {
    return (
      <Sidebar>
        <div className="mx-auto w-8/12 h-screen bg-white shadow overflow-auto sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h1 className="flex justify-center">{eventData.name}</h1>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Date</dt>
                <dd className="mt-1 text-sm text-gray-900">{eventData.day}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Time</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {startTimeLabel} - {endTimeLabel}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">
                  Description
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {eventData.description}
                </dd>
              </div>
              {/* render for a guest only */}
              {eventData.hostId !== userRecord.uid && (
                <div className="sm:col-span-2">
                  <dd className="mt-1 text-sm text-gray-900">
                    <div id="eventFinalizedButtons">
                      <button
                        type="button"
                        className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        onClick={handleAccept}
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        onClick={handleDecline}
                      >
                        Decline
                      </button>
                      <button
                        type="button"
                        className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-500 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
                        onClick={handleRemove}
                      >
                        Leave
                      </button>
                    </div>
                  </dd>
                </div>
              )}
              {/* render for the host only */}
              {eventData.hostId === userRecord.uid && (
                <div className="sm:col-span-2">
                  <dd className="mt-1 text-sm text-gray-900">
                    <div id="eventFinalizedButtons">
                      <button
                        type="button"
                        className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        onClick={handleDelete}
                      >
                        Delete Event
                      </button>
                    </div>
                  </dd>
                </div>
              )}
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Attendees</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <ul
                    // role="list"
                    className="max-w-sm border border-gray-200 rounded-md divide-y divide-gray-200"
                  >
                    {eventGuests.map((guestName) => {
                      return guestName.status === 'ACCEPTED' ? (
                        <li className="pr-4 py-3 flex items-center justify-between text-sm">
                          <div className="w-0 flex-1 flex items-center">
                            <span className="ml-2 flex-1 w-0 truncate">
                              {guestName.firstName} {guestName.lastName}
                            </span>
                          </div>
                          {/* render for the host only */}
                        </li>
                      ) : (
                        <></>
                      );
                    })}
                  </ul>
                </dd>
              </div>
              {eventData.hostId === userRecord.uid && (
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">
                    Declinees
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <ul
                      // role="list"
                      className="max-w-sm border border-gray-200 rounded-md divide-y divide-gray-200"
                    >
                      {eventGuests.map((guestName) => {
                        return guestName.status === 'DECLINED' ? (
                          <li className="pr-4 py-3 flex items-center justify-between text-sm">
                            <div className="w-0 flex-1 flex items-center">
                              <span className="ml-2 flex-1 w-0 truncate">
                                {guestName.firstName} {guestName.lastName}
                              </span>
                            </div>
                            {/* render for the host only */}
                          </li>
                        ) : (
                          <></>
                        );
                      })}
                    </ul>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </Sidebar>
    );
  }

  // default render
  return <></>;
}
