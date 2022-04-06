import React from 'react';
import './HomePage.css';
import { Link } from 'react-router-dom';
import { useUserRecordContext } from '../../contexts/UserRecordContext';
import PageSpinner from '../../components/PageSpinner/PageSpinner';
import Page from '../../components/Page/Page';
import LandingPage from '../LandingPage/LandingPage';

export default function HomePage(): JSX.Element {
  const { pending, userRecord } = useUserRecordContext();

  if (pending) {
    return (
      <Page>
        <PageSpinner />
      </Page>
    );
  }

  if (userRecord) {
    return (
      <Page>
        <div className="home-page-content">
          <pre className="s-header">Welcome {`${userRecord.firstName}!`}</pre>
          <div className="text-center">
            <Link to="/create-event" className="btn-links btn btn-info btn-lg">
              Create Event
            </Link>
          </div>
          <div className="text-center">
            <Link to="/calendar" className="btn-links btn btn-info btn-lg">
              Current Calendar
            </Link>{' '}
          </div>
        </div>
      </Page>
    );
  }

  return <LandingPage />;
}
