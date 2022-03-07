import React from 'react';
import { Button, ListGroup } from 'react-bootstrap';

import { EventDocument, EventGuest } from 'wya-api/dist/interfaces';
import {
  updateGuest,
  getDocSnapshot$,
  getAllSubCollDocsSnapshot$,
} from '../../lib/firestore';
import { useUserRecordContext } from '../../contexts/UserRecordContext';

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
  const [userIdxFromGuests, setUserIdxFromGuests] = React.useState<number>(-1);

  React.useEffect(() => {
    console.log('rendered - react use effect');
    if (userRecord) {
      // collect information from event which was finalized
      getDocSnapshot$(`/${process.env.REACT_APP_EVENTS}/${match.params.id}`, {
        next: (eventSnapshot) => {
          const event = eventSnapshot.data() as EventDocument;

          // collect guests from finalized event
          getAllSubCollDocsSnapshot$(
            `/${process.env.REACT_APP_EVENTS}/${match.params.id}/${process.env.REACT_APP_EVENT_GUESTS}`,
            {
              next: (eventGuestsSnapshot) => {
                if (!eventGuestsSnapshot.empty) {
                  let guests: EventGuest[] = [];

                  eventGuestsSnapshot.forEach((doc) => {
                    // get guest using document id
                    getDocSnapshot$(
                      `/${process.env.REACT_APP_EVENTS}/${match.params.id}/${process.env.REACT_APP_EVENT_GUESTS}/${doc.id}`,
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
                              guests.some((guest, idx) => {
                                if (guest.uid === userRecord.email) {
                                  setUserIdxFromGuests(idx);
                                  return true;
                                }
                              });
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

          setEventData(event);
        },
      });
    }
  }, [userRecord, match.params.id]);

  const handleAccept = () => {
    if (userIdxFromGuests !== -1) {
      const user: EventGuest = eventGuests[userIdxFromGuests];
      user.status = 'ACCEPTED';
      updateGuest(match.params.id, user);
    }
  };

  const handleDecline = () => {
    if (userIdxFromGuests !== -1) {
      const user: EventGuest = eventGuests[userIdxFromGuests];
      user.status = 'DECLINED';
      updateGuest(match.params.id, user);
    }
  };

  if (userRecord && eventData && eventGuests && userIdxFromGuests !== -1) {
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
              <u>Starts</u>: {eventData.startTime}
            </p>
            <p>
              <u>Ends</u>: {eventData.endTime}
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
