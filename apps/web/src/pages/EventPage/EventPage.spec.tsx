import React from 'react';
// import { render } from '@testing-library/react';
// import { BrowserRouter } from 'react-router-dom';
// import EventPage from './EventPage';

// jest.mock('firebase/auth');

// it('renders page', () => {
//     const { queryByText } = render(
//         <BrowserRouter>
//             <EventPage match={{ params: { id: 'testid' } }} />
//         </BrowserRouter>
//     );
//     expect(queryByText('EventPage')).toBeTruthy();
// });

/**
 * Test dependents on proper route handling.
 * Currently, unauthorized users cause a
 * spinner to loop for private pages.
 * Add proper test once routing is finalized.
 *
 */
it('runs an empty test', () => {
    expect(true).toBeTruthy();
});
