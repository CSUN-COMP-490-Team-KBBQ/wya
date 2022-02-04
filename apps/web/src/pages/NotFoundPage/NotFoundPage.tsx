import React from 'react';
import Container from 'react-bootstrap/Container';
import Page from '../../components/Page/Page';
import './NotFoundPage.css';

export default function NotFoundPage(): JSX.Element {
    return (
        <Page>
            <Container>
                <h1
                    style={{
                        margin: 'auto',
                        marginTop: '250px',
                    }}
                >
                    404 Page Not Found
                </h1>
            </Container>
        </Page>
    );
}
