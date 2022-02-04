import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginForm from './LoginForm';

jest.mock('firebase/app');
jest.mock('firebase/auth');

it('renders component', () => {
    const { queryAllByText } = render(
        <BrowserRouter>
            <LoginForm />
        </BrowserRouter>
    );
    expect(queryAllByText('Email')).toBeTruthy();
    expect(queryAllByText('Password')).toBeTruthy();
});
