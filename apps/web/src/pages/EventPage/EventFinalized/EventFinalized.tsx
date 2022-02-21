import React from 'react';
import { Alert, Button, ListGroup } from 'react-bootstrap';
import { v4 as uuid } from 'uuid';

import EventData from '../../../interfaces/EventData';
import UserData from '../../../interfaces/User';
import { updateEvent, updateUserRecord } from '../../../lib/firestore';

import '../EventPage.css';

interface EventFinalizedProps {
  event: EventData;
  user: UserData;
  isHost: boolean;
}

export default function EventFinalized({
  event,
  user,
  isHost,
}: EventFinalizedProps): JSX.Element {
  const eventInUserRecord = user.events.find(
    (e) => e.eventId === event.eventId
  )!;
  const { accepted, declined } = eventInUserRecord;

  const handleAccept = () => {
    eventInUserRecord.accepted = true;
    eventInUserRecord.declined = false;
    event.rsvp.push(`${user.firstName} ${user.lastName}`);

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
      <h1>{event.name}</h1>
      <div id="eventFinalizedPs">
        <p>
          <u>Description</u>: {event.description}
        </p>
        {/* add who is hosting here? */}
        <p>
          <u>Day</u>: {event.day}
        </p>
        <p>
          <u>Starts</u>: {event.startTime}
        </p>
        <p>
          <u>Ends</u>: {event.endTime}
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
          {event.rsvp.map((guestName) => {
            // include key prop with unique key
            return <ListGroup.Item key={uuid()}>{guestName}</ListGroup.Item>;
          })}
        </ListGroup>
      </div>
    </div>
  );
}
