import React from 'react';
import { Button, ListGroup } from 'react-bootstrap';
import { useState } from 'react';
import { useHistory, Link } from 'react-router-dom';

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

import Page from '../../components/Page/Page';

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

  // The following code is here to keep a record of how to use the api calls

  // const handleDelete = async () => {
  //   if (eventData !== undefined && userRecord) {
  //     await api.post(
  //       '/events/delete',
  //       JSON.stringify({ eventId: eventData.eventId })
  //     );

  //     console.log('Event deleted');
  //     history.push('/calendar');
  //   }
  // };

  // const handleRemove = async () => {
  //   if (eventData !== undefined && userRecord) {
  //     await api.post('/events/guests/delete', { eventId: eventData.eventId });

  //     console.log('Event Guest removed');
  //     history.push('/calendar');
  //   }
  // };

  // const handleUpdateGuests = async () => {
  //   if (eventData !== undefined && userRecord) {
  //     await api.post('events/update-guests', {
  //       eventId: eventData.eventId,
  //       guestsByUserId: eventGuests
  //         .filter(
  //           (guest) =>
  //             guest.status === EVENT_GUEST_STATUS.ACCEPTED ||
  //             guest.status === EVENT_GUEST_STATUS.PENDING
  //         )
  //         .map((guest) => guest.uid),
  //     });

  //     console.log('Guests Updated');
  //   }
  // };

  if (userRecord && eventData && eventGuests) {
    return (
      <Sidebar>
        <div
          id="eventContainer"
          className="text-left bg-white shadow overflow-hidden sm:rounded-lg"
        >
          <div className="mb-2 px-4 pt-5 sm:px-6">
            <h3 className="text-left text-lg leading-6 font-medium text-gray-900">
              {eventData.name}
            </h3>
          </div>
          <div className="">
            <dl className="sm:divide-y sm:divide-gray-200">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Full name</dt>
                <dd className="mt-1 text-sm text-gray-900">Margot Foster</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">
                  Application for
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  Backend Developer
                </dd>
              </div>
              <div className="py-4 mt-6 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-left text-sm font-medium text-gray-500">
                  Description
                </dt>
                <dd className="text-left mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {eventData.description}
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-left text-sm font-medium text-gray-500">
                  Date
                </dt>
                <dd className="text-left mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {eventData.day}
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-left text-sm font-medium text-gray-500">
                  Time
                </dt>
                <dd className="text-left mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {eventData.dailyStartTime} to {eventData.dailyEndTime}
                </dd>
              </div>

              {/* render for a guest only */}
              {eventData.hostId !== userRecord.uid && (
                <div id="eventFinalizedButtons">
                  <Button onClick={handleDecline} variant="danger">
                    Decline
                  </Button>
                  <Button onClick={handleAccept} variant="success">
                    Accept
                  </Button>
                </div>
              )}
              <div className="py-4 mt-6 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-left text-sm font-medium text-gray-500">
                  Attending
                </dt>
                <dd className="text-left mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <ListGroup className="attending-list">
                    {eventGuests.map((guestName) => {
                      return guestName.status === 'ACCEPTED' ? (
                        <ListGroup.Item>
                          {guestName.firstName} {guestName.lastName}
                        </ListGroup.Item>
                      ) : (
                        <></>
                      );
                    })}
                  </ListGroup>
                </dd>
              </div>
              <div>
                {/* <h2>Attending</h2>
                <ListGroup className="attending-list">
                  {eventGuests.map((guestName) => {
                    return guestName.status === 'ACCEPTED' ? (
                      <ListGroup.Item>
                        {guestName.firstName} {guestName.lastName}
                      </ListGroup.Item>
                    ) : (
                      <></>
                    );
                  })}
                </ListGroup> */}
              </div>
            </dl>
          </div>
        </div>
      </Sidebar>
    );
  }

  // default render
  return (
    // <Page>
    <></>
    // {/* </Page> */}
  );
}
