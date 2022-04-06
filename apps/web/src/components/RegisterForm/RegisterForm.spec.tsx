import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RegisterForm from './RegisterForm';

jest.mock('firebase/app');
jest.mock('firebase/auth');

it('renders component', () => {
  render(
    <BrowserRouter>
      <RegisterForm />
    </BrowserRouter>
  );
  expect(screen.getAllByText('First Name')).toBeTruthy();
  expect(screen.getAllByText('Last Name')).toBeTruthy();
  expect(screen.getAllByText('Email')).toBeTruthy();
  expect(screen.getAllByText('Password')).toBeTruthy();
});
