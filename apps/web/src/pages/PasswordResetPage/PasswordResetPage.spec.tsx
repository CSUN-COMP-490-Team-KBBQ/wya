import React from 'react';
import { render } from '@testing-library/react';
import PasswordResetPage from './PasswordResetPage';

jest.mock('firebase/auth');

it('renders component', () => {
  const { queryByText } = render(<PasswordResetPage />);
  expect(queryByText('Password Reset')).toBeTruthy();
});
