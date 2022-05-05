import React from 'react';
import { Button, ListGroup } from 'react-bootstrap';
import { useState } from 'react';

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

export default function EventFinalizedPage({
  match,
}: {
  match: {
    params: {
      id: string;
    };
  };
}): JSX.Element {
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
        <div id="eventFinalizedContent">
          <h1>{eventData.name}</h1>
          <div id="eventFinalizedPs">
            <p>
              <u>Description</u>: {eventData.description}
            </p>
            {/* add who is hosting here? */}
            <p>
              <u>Day</u>: {eventData.day}
            </p>
            <p>
              <u>Starts</u>: {eventData.dailyStartTime}
            </p>
            <p>
              <u>Ends</u>: {eventData.dailyEndTime}
            </p>
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
          <div>
            <h2>Attending</h2>
            <ListGroup className="attending-list">
              {eventGuests.map((guestName) => {
                return guestName.status === 'ACCEPTED' ? (
                  <ListGroup.Item>{guestName.uid}</ListGroup.Item>
                ) : (
                  <></>
                );
              })}
            </ListGroup>
          </div>
        </div>
      </Sidebar>
    );
  }

  // default render
  return (
    <Page>
      <></>
    </Page>
  );
}
