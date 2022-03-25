import React from 'react';
import { render } from '@testing-library/react';
import ChangePasswordForm from './ChangePasswordForm';

it('renders component', () => {
  const { queryByText } = render(<ChangePasswordForm />);
  expect(queryByText('Old Password')).toBeTruthy();
});
