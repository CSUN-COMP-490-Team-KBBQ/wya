import React from 'react';
import { render } from '@testing-library/react';
import GuestList from './GuestList';

const updateGuests = jest.fn();

// clear mock after each test
afterEach(updateGuests.mockClear);

it('renders component', () => {
  const { queryByTestId } = render(
    <GuestList guests={[]} updateGuests={updateGuests} />
  );
  expect(queryByTestId('guests-list')).toBeTruthy();
});
