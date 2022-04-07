import React from 'react';
import { render, screen } from '@testing-library/react';
import GuestList from './GuestList';

const updateGuests = jest.fn();

// clear mock after each test
afterEach(updateGuests.mockClear);

it('renders component', () => {
  render(<GuestList guests={[]} updateGuests={updateGuests} />);
  expect(screen.getByTestId('guests-list')).toBeTruthy();
});
