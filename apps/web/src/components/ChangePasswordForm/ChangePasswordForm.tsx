import React from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import './ChangePasswordForm.css';

export default function ChangePasswordForm(): JSX.Element {
    return (
        <Form.Group>
            <Form.Label>Old Password</Form.Label>
            <Form.Control
                type="password"
                name="oldPassword"
                className="form-input"
            />
            <Form.Label>New Password</Form.Label>
            <Form.Control
                type="password"
                name="newPassword"
                className="form-input"
            />
            <Button id="passwordUpdateBtn" type="submit">
                Update Password
            </Button>
        </Form.Group>
    );
}
