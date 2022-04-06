import React from 'react';
import { render, screen } from '@testing-library/react';
import PageSpinner from './PageSpinner';

it('renders component', () => {
  render(<PageSpinner />);
  expect(screen.getByTestId('page-spinner')).toBeTruthy();
});
