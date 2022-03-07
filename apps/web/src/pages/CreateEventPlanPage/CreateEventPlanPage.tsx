import React from 'react';
import Container from 'react-bootstrap/Container';
import CreateEventPlanForm from '../../components/CreateEventPlanForm/CreateEventPlanForm';
import Page from '../../components/Page/Page';
import './CreateEventPlanPage.css';

export default function CreateEventPlanPage(): JSX.Element {
  return (
    <Page>
      <Container fluid>
        <CreateEventPlanForm />
      </Container>
    </Page>
  );
}
