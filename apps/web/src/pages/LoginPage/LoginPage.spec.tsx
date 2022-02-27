import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from './LoginPage';

jest.mock('firebase/app');
jest.mock('firebase/auth');

it('renders component', () => {
  const { queryAllByText } = render(
    <BrowserRouter>
      <LoginPage />
    </BrowserRouter>
  );
  expect(queryAllByText('Login Page')).toBeTruthy();
});
