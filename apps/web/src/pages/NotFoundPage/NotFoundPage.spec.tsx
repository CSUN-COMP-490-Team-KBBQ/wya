import React from 'react';
import { render } from '@testing-library/react';
import NotFoundPage from './NotFoundPage';

jest.mock('firebase/app');
jest.mock('firebase/auth');
jest.mock('firebase/firestore');

it('renders component', () => {
  const { queryByText } = render(<NotFoundPage />);
  expect(queryByText('404 Page Not Found')).toBeTruthy();
});
