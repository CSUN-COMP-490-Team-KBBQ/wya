import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginForm from './LoginForm';

jest.mock('firebase/app');
jest.mock('firebase/auth');

it('renders component', () => {
  render(
    <BrowserRouter>
      <LoginForm />
    </BrowserRouter>
  );
  expect(screen.getAllByText('Email')).toBeTruthy();
  expect(screen.getAllByText('Password')).toBeTruthy();
});
