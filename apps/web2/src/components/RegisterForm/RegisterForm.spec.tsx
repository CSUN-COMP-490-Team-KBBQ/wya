import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RegisterForm from './RegisterForm';

jest.mock('firebase/app');
jest.mock('firebase/auth');

it('renders component', () => {
  const { queryAllByText } = render(
    <BrowserRouter>
      <RegisterForm />
    </BrowserRouter>
  );
  expect(queryAllByText('First Name')).toBeTruthy();
  expect(queryAllByText('Last Name')).toBeTruthy();
  expect(queryAllByText('Email')).toBeTruthy();
  expect(queryAllByText('Password')).toBeTruthy();
});
