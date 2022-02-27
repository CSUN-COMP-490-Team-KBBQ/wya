import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CreateEventPlanPage from './CreateEventPlanPage';

jest.mock('firebase/app');
jest.mock('firebase/auth');
jest.mock('firebase/firestore');

it('renders page', () => {
    const { queryByText } = render(
        <BrowserRouter>
            <CreateEventPlanPage />
        </BrowserRouter>
    );
    expect(queryByText('Name')).toBeTruthy();
});
