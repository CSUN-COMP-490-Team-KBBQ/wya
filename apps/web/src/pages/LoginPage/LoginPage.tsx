import React from 'react';
import Container from 'react-bootstrap/Container';
import LoginForm from '../../components/LoginForm/LoginForm';
import Page from '../../components/Page/Page';
import './LoginPage.css';

export default function LoginPage(): JSX.Element {
    return (
        <Page>
            <Container id="loginPageContainer" fluid>
                <h1>Log In</h1>
                <LoginForm />
            </Container>
        </Page>
    );
}
