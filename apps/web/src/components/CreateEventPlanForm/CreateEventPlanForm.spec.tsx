import React from 'react';
import { render } from '@testing-library/react';
import CreateEventPlanForm from './CreateEventPlanForm';

jest.mock('firebase/app');
jest.mock('firebase/auth');
jest.mock('firebase/firestore');

it('renders component', () => {
    const { queryByText } = render(<CreateEventPlanForm />);
    expect(queryByText('Name')).toBeTruthy();
});
