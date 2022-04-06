import React from 'react';
import { render, screen } from '@testing-library/react';
import ChangePasswordForm from './ChangePasswordForm';

it('renders component', () => {
  render(<ChangePasswordForm />);
  expect(screen.getByText('Old Password')).toBeTruthy();
});
