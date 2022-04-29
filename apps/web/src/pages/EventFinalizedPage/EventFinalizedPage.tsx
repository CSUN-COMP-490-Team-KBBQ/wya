import React from 'react';
import { Button, ListGroup } from 'react-bootstrap';

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
import { useHistory } from 'react-router-dom';

import Page from '../../components/Page/Page';

import './EventFinalizedPage.css';
import api from '../../modules/api';

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
  const [eventData, setEventData] = React.useState<EventDocument>();
  const [eventGuests, setEventGuests] = React.useState<EventGuest[]>([]);
  const history = useHistory();

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
    if (eventData !== undefined && userRecord) {
      const user: EventGuest = eventGuests.find(
        (obj) => obj.uid === userRecord.uid
      ) as EventGuest;
      user.status = EVENT_GUEST_STATUS.ACCEPTED;

      await api.post('/events/guests/update-status', {
        status: user.status,
        eventId: eventData.eventId,
      });
    }
  };

  const handleDecline = async () => {
    if (eventData !== undefined && userRecord) {
      const user: EventGuest = eventGuests.find(
        (obj) => obj.uid === userRecord.uid
      ) as EventGuest;
      user.status = EVENT_GUEST_STATUS.DECLINED;

      await api.post('/events/guests/update-status', {
        status: user.status,
        eventId: eventData.eventId,
      });
    }
  };

  const handleDelete = async () => {
    if (eventData !== undefined && userRecord) {
      await api.post(
        '/events/delete',
        JSON.stringify({ eventId: eventData.eventId })
      );

      console.log('Event deleted');
      history.push('/calendar');
    }
  };

  const handleRemove = async () => {
    if (eventData !== undefined && userRecord) {
      await api.post('/events/guests/delete', { eventId: eventData.eventId });

      console.log('Event Guest removed');
      history.push('/calendar');
    }
  };

  const handleUpdateGuests = async () => {
    if (eventData !== undefined && userRecord) {
      await api.post('events/update-guests', {
        eventId: eventData.eventId,
        guestsByUserId: eventGuests
          .filter(
            (guest) =>
              guest.status === EVENT_GUEST_STATUS.ACCEPTED ||
              guest.status === EVENT_GUEST_STATUS.PENDING
          )
          .map((guest) => guest.uid),
      });

      console.log('Guests Updated');
    }
  };

  const handleDeleteGuests = async () => {
    if (eventData !== undefined && userRecord) {
      await api.post('events/delete-guests', {
        eventId: eventData.eventId,
        guestsByUserId: eventGuests
          .filter((guest) => guest.status === EVENT_GUEST_STATUS.DECLINED)
          .map((guest) => guest.uid),
      });

      console.log('Guests Deleted');
    }
  };

  if (userRecord && eventData && eventGuests) {
    return (
      <Page>
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
          <div id="eventFinalizedButtons">
            <Button onClick={handleDelete} variant="danger">
              Delete Event
            </Button>
            <Button onClick={handleUpdateGuests} variant="danger">
              Update Guests
            </Button>
            <Button onClick={handleDeleteGuests} variant="danger">
              Delete Declined Guests
            </Button>
          </div>
          {/* render for a guest only */}
          {eventData.hostId !== userRecord.uid && (
            <div id="eventFinalizedButtons">
              <Button onClick={handleRemove} variant="danger">
                Leave Event
              </Button>
              <Button onClick={handleDecline} variant="danger">
                Decline
              </Button>
              <Button onClick={handleAccept} variant="success">
                Accept
              </Button>
            </div>
          )}
          {/* {eventData.hostId !== userRecord.uid && (
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
            )} */}
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
