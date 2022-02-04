import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CreateEventPage from './CreateEventPage';

jest.mock('firebase/app');
jest.mock('firebase/auth');
jest.mock('firebase/firestore');

it('renders page', () => {
    const { queryByText } = render(
        <BrowserRouter>
            <CreateEventPage />
        </BrowserRouter>
    );
    expect(queryByText('Name')).toBeTruthy();
});
