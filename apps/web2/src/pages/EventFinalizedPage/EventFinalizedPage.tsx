import React from 'react';
import { Button, ListGroup } from 'react-bootstrap';
import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  HomeIcon,
  MenuIcon,
  UserGroupIcon,
  XIcon,
} from '@heroicons/react/outline';

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

import LandingPage from '../LandingPage/LandingPage';
import SettingsPage from '../SettingsPage/SettingsPage';
import EventPage from '../EventPage/EventPage';
import Page from '../../components/Page/Page';

import logo from '../../assets/wya-logo.png';
import './EventFinalizedPage.css';

const content = {
  DASHBOARD: 'dashboard',
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
    name: 'Friends',
    icon: UserGroupIcon,
    content: content.FRIENDS,
    current: false,
  },
];

// @ts-ignore
function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentContent, setCurrentContent] = useState(content.DASHBOARD);
  const [nav, setNav] = useState(navigation);

  const loadContent = (type: string) => {
    let updatedNav: any = [];
    nav.forEach((item) =>
      updatedNav.push({
        name: item.name,
        icon: item.icon,
        content: item.content,
        current: item.content === type,
      })
    );

    setCurrentContent(type);
    setNav(updatedNav);
    setSidebarOpen(false);
  };

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
        <div className="h-full flex">
          {/* Sidebar for mobile */}
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog
            as="div"
            className="fixed inset-0 flex z-40 lg:hidden"
            onClose={setSidebarOpen}
          >
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-gray-600 bg-opacity-75" />
            </Transition.Child>
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white focus:outline-none">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute top-0 right-0 -mr-12 pt-2">
                    <button
                      type="button"
                      className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XIcon
                        className="h-6 w-6 text-white"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </Transition.Child>
                <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                  <div className="flex-shrink-0 flex items-center px-4 justify-center">
                    <img className="h-10 w-auto" src={logo} alt="wya? logo" />
                  </div>
                  <nav aria-label="Sidebar" className="mt-5">
                    <div className="px-2 space-y-1">
                      {nav.map((item) => (
                        <button
                          key={item.name}
                          onClick={() => loadContent(item.content)}
                          className={classNames(
                            item.current
                              ? 'bg-gray-100 text-gray-900'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                            'group flex items-center px-2 py-2 text-base font-medium rounded-md no-underline w-full'
                          )}
                        >
                          <item.icon
                            className={classNames(
                              item.current
                                ? 'text-gray-500'
                                : 'text-gray-400 group-hover:text-gray-500',
                              'mr-4 h-6 w-6'
                            )}
                            aria-hidden="true"
                          />
                          {item.name}
                        </button>
                      ))}
                    </div>
                  </nav>
                </div>
                <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                  <button
                    onClick={() => loadContent(content.SETTINGS)}
                    className="flex-shrink-0 group block no-underline"
                  >
                    <div className="flex items-center">
                      <div className="inline-block h-10 w-10 rounded-full overflow-hidden bg-gray-200">
                        {/* can add image tag for profile pics in future work */}
                        <svg
                          className="h-full w-full text-gray-300"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <div className="ml-3 text-left">
                        <p className="text-base font-medium text-gray-700 group-hover:text-gray-900 mb-0">
                          Whitney Francis
                        </p>
                        <p className="text-sm font-medium text-gray-500 group-hover:text-gray-700 mb-0">
                          View profile
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </Transition.Child>
            <div className="flex-shrink-0 w-14" aria-hidden="true">
              {/* Force sidebar to shrink to fit close icon */}
            </div>
          </Dialog>
        </Transition.Root>
        {/* Static sidebar for desktop */}
        <div className="hidden lg:flex lg:flex-shrink-0">
          <div className="flex flex-col w-64">
            {/* Sidebar component, swap this element with another sidebar if you like */}
            <div className="flex-1 flex flex-col min-h-screen border-r border-gray-200 bg-gray-100">
              <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                <div className="flex items-center flex-shrink-0 px-4 justify-center">
                  <img className="h-10 w-auto" src={logo} alt="wya? logo" />
                </div>
                <nav className="mt-5 flex-1" aria-label="Sidebar">
                  <div className="px-2 space-y-1">
                    {nav.map((item) => (
                      <button
                        key={item.name}
                        onClick={() => loadContent(item.content)}
                        className={classNames(
                          item.current
                            ? 'bg-gray-200 text-gray-900'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                          'group flex items-center px-2 py-2 text-sm font-medium rounded-md no-underline w-full'
                        )}
                      >
                        <item.icon
                          className={classNames(
                            item.current
                              ? 'text-gray-500'
                              : 'text-gray-400 group-hover:text-gray-500',
                            'mr-3 h-6 w-6'
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                      </button>
                    ))}
                  </div>
                </nav>
              </div>
              <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                <button
                  onClick={() => loadContent(content.SETTINGS)}
                  className="flex-shrink-0 w-full group block no-underline"
                >
                  <div className="flex items-center">
                    <div className="inline-block h-9 w-9 rounded-full overflow-hidden bg-gray-200">
                      <svg
                        className="h-full w-full text-gray-300"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div className="ml-3 text-left">
                      <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900 mb-0">
                        Whitney Francis
                      </p>
                      <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700 mb-0">
                        View profile
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
          <div className="lg:hidden">
            <div className="flex items-center justify-between bg-gray-50 border-b border-gray-200 px-4 py-1.5">
              <div>
                <img className="h-8 w-auto" src={logo} alt="wya? logo" />
              </div>
              <div>
                <button
                  type="button"
                  className="-mr-3 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900"
                  onClick={() => setSidebarOpen(true)}
                >
                  <span className="sr-only">Open sidebar</span>
                  <MenuIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
          {/* Content */}
          {currentContent === content.FRIENDS ? (
            <></>
          ) : currentContent === content.SETTINGS ? (
            <SettingsPage />
          ) : (
            // Added as an example - this will be for the event pages once we finalize dashboard
            <EventPage />
          )}
        </div>
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
        </div>
    );
  }

  // default render
  return (
    <Page>
      <></>
    </Page>
  );
}
