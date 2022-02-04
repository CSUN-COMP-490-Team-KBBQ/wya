import React from 'react';
import Container from 'react-bootstrap/Container';
import RegisterForm from '../../components/RegisterForm/RegisterForm';
import Page from '../../components/Page/Page';
import './RegisterPage.css';

export default function RegisterPage(): JSX.Element {
    return (
        <Page>
            <Container id="registerPageContainer" fluid>
                <h1>Register</h1>
                <RegisterForm />
            </Container>
        </Page>
    );
}
