import React from 'react';
import { render } from '@testing-library/react';
import ProfilePage from './ProfilePage';

jest.mock('firebase/auth');

it('renders component', () => {
    const { queryByText } = render(<ProfilePage />);
    expect(queryByText('Change Password')).toBeTruthy();
});
