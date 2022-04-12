import React from 'react';
import { Button, ListGroup } from 'react-bootstrap';

import {
  EventDocument,
  EventGuest,
  EventId,
  EVENT_GUEST_STATUS,
  UserId,
} from '../../interfaces';
import {
  updateGuest,
  getDocSnapshot$,
  getAllSubCollDocsSnapshot$,
  deleteEventFinalized,
  deleteEventGuest,
} from '../../lib/firestore';
import { useUserRecordContext } from '../../contexts/UserRecordContext';
import { useHistory } from 'react-router-dom';

import Page from '../../components/Page/Page';

import './EventFinalizedPage.css';

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

  const handleAccept = () => {
    if (userRecord) {
      const user: EventGuest = eventGuests.find(
        (obj) => obj.uid === userRecord.uid
      ) as EventGuest;
      user.status = EVENT_GUEST_STATUS.ACCEPTED;
      updateGuest(match.params.id, user);
    }
  };

  const handleDecline = () => {
    if (userRecord) {
      const user: EventGuest = eventGuests.find(
        (obj) => obj.uid === userRecord.uid
      ) as EventGuest;
      user.status = EVENT_GUEST_STATUS.DECLINED;
      updateGuest(match.params.id, user);
    }
  };

  const handleDelete = async () => {
    if (eventData !== undefined && userRecord) {
      const dataNeededToDelete: { eventId: EventId } & {
        hostId: UserId;
      } = {
        eventId: eventData.eventId,
        hostId: userRecord.uid as UserId,
      };

      await deleteEventFinalized(dataNeededToDelete);

      console.log('Event deleted');
      history.push('/calendar');
    }
  };

  const handleRemove = async () => {
    if (eventData !== undefined && userRecord) {
      const dataNeededToDelete: { eventId: EventId } & { userId: UserId } = {
        eventId: eventData.eventId,
        userId: userRecord.uid as UserId,
      };

      await deleteEventGuest(dataNeededToDelete);

      console.log('Event Guest deleted');
      history.push('/calendar');
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
            <Button onClick={handleRemove} variant="danger">
              Leave Event
            </Button>
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
