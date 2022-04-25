import React from 'react';
import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  HomeIcon,
  MenuIcon,
  UserGroupIcon,
  XIcon,
  PencilIcon,
} from '@heroicons/react/outline';
import { Button, ListGroup } from 'react-bootstrap';

import LandingPage from '../LandingPage/LandingPage';
import SettingsPage from '../SettingsPage/SettingsPage';
import CalendarPage from '../CalendarPage/CalendarPage';
import CreateEventPlanPage from '../CreateEventPlanPage/CreateEventPlanPage';

import PageSpinner from '../../components/PageSpinner/PageSpinner';
import logo from '../../assets/wya-logo.png';

import {
  EventDocument,
  EventGuest,
  EVENT_GUEST_STATUS,
} from '../../interfaces';
import {
  updateGuest,
  getDocSnapshot$,
  getAllSubCollDocsSnapshot$,
} from '../../lib/firestore';
import { useUserRecordContext } from '../../contexts/UserRecordContext';

const content = {
  DASHBOARD: 'dashboard',
  PLANEVENT: 'create-event',
  FRIENDS: 'friends',
  SETTINGS: 'settings',
};

const navigation = [
  {
    name: 'Dashboard',
    icon: HomeIcon,
    content: content.DASHBOARD,
    current: true,
  },
  {
    name: 'Plan An Event',
    icon: PencilIcon,
    content: content.PLANEVENT,
    current: false,
  },
  {
    name: 'Friends',
    icon: UserGroupIcon,
    content: content.FRIENDS,
    current: false,
  },
];

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
