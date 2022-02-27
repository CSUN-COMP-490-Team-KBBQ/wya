import React from 'react';
import Container from 'react-bootstrap/Container';
import CreateEventForm from '../../components/CreateEventForm/CreateEventForm';
import Page from '../../components/Page/Page';
import './CreateEventPage.css';

export default function CreateEventPage(): JSX.Element {
  return (
    <Page>
      <Container fluid>
        <CreateEventForm />
      </Container>
    </Page>
  );
}
