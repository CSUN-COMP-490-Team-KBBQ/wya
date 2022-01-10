import React from 'react';
import { render } from '@testing-library/react';
import Button from './Button';

it('renders', () => {
  render(<Button />);
  expect(true).toBeTruthy();
});
  