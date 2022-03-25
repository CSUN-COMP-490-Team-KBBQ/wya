import React from 'react';
import { render } from '@testing-library/react';
import EventPlanList from './EventPlanList';

const FAKE_USER_EVENT_PLANS = [
  {
    name: 'test event plan',
    description: '',
    dailyStartTime: '9:00',
    dailyEndTime: '10:00',
    startDate: '2021-11-01',
    endDate: '2021-11-02',
    hostId: 'host1',
    invitees: ['invitee1', 'invitee2'],
    eventPlanId: 'u8aaed22-c7a5-441c-9d68-52f5d30v2f602',
  },
];

it('renders component', () => {
  const { queryByText } = render(
    <EventPlanList
      elementId="calender-event-plan-list"
      eventPlans={FAKE_USER_EVENT_PLANS}
    />
  );
  expect(queryByText('Event Plans')).toBeTruthy();
  expect(queryByText('test event plan')).toBeTruthy();
});
