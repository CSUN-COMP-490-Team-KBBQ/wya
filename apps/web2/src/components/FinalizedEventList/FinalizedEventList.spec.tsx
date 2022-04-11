import React from 'react';
import { render, screen } from '@testing-library/react';
import EventList from './FinalizedEventList';

const FAKE_USER_EVENTS = [
  {
    name: 'test event',
    description: '',
    dailyStartTime: '8:00',
    dailyEndTime: '9:00',
    startDate: '2022-11-01',
    endDate: '2022-11-02',
    hostId: 'host1',
    invitees: ['invitee1', 'invitee2'],
    eventPlanId: 'u8aaed22-c7a5-441c-9d68-52f5d30v2f602',
  },
];

// it('renders component', () => {
//   render(
//     <EventList
//       elementId="calender-event-plan-list"
//       events={FAKE_USER_EVENTS}
//     />
//   );
//   expect(screen.getByText('Upcoming Events')).toBeTruthy();
//   expect(screen.getByText('test event')).toBeTruthy();
// });
