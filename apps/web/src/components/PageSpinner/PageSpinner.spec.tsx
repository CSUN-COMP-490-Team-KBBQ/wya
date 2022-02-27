import React from 'react';
import { render } from '@testing-library/react';
import PageSpinner from './PageSpinner';

it('renders component', () => {
  const { queryByTestId } = render(<PageSpinner />);
  expect(queryByTestId('page-spinner')).toBeTruthy();
});
