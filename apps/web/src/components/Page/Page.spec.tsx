import React from 'react';
import { render } from '@testing-library/react';
import Page from './Page';

jest.mock('firebase/app');
jest.mock('firebase/auth');
jest.mock('firebase/firestore');

it('renders component', () => {
  render(<Page />);
  expect(true).toBeTruthy();
});
