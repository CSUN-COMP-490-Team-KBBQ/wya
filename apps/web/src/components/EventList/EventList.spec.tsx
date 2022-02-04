import React from 'react';
import { render } from '@testing-library/react';
import EventList from './EventList';

const FAKE_USER_EVENTS = [
  {
    eventId: 'u8aaed22-c7a5-441c-9d68-52f5d30v2f602',
    name: 'test event',
    description: '',
    startDate: '2021-11-01',
    startTime: '9:00',
    role: 'Guest',
    accepted: true,
    declined: false,
  },
];

it('renders component', () => {
  const { queryByText } = render(
    <EventList elementId="calender-event-list" events={FAKE_USER_EVENTS} />
  );
  expect(queryByText('Events')).toBeTruthy();
  expect(queryByText('test event')).toBeTruthy();
});
