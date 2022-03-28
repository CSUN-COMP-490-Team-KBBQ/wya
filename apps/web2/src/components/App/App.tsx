import React from 'react';
import { Route, Switch, BrowserRouter } from 'react-router-dom';

import LoginPage from '../../pages/LoginPage/LoginPage';
import RegisterPage from '../../pages/RegisterPage/RegisterPage';
import PrivateRoute from '../PrivateRoute/PrivateRoute';
import PasswordResetPage from '../../pages/PasswordResetPage/PasswordResetPage';
import CreateEventPage from '../../pages/CreateEventPage/CreateEventPage';
import CreateEventPlanPage from '../../pages/CreateEventPlanPage/CreateEventPlanPage';
import EventPage from '../../pages/EventPage/EventPage';
import CalendarPage from '../../pages/CalendarPage/CalendarPage';
import ProfilePage from '../../pages/ProfilePage/ProfilePage';
import NotFoundPage from '../../pages/NotFoundPage/NotFoundPage';
import { UserAuthProvider } from '../../contexts/UserContext';
import { UserRecordProvider } from '../../contexts/UserRecordContext';

import 'bootstrap/dist/css/bootstrap.min.css';
import LandingPage from '../../pages/LandingPage/LandingPage';
import EventPlanPage from '../../pages/EventPlanPage/EventPlanPage';
import EventFinalizedPage from '../../pages/EventFinalizedPage/EventFinalizedPage';
import SamplePage from '../../pages/SamplePage/SamplePage';
import HomePage from '../../pages/HomePage/HomePage';

export default function App(): JSX.Element {
  return (
    <UserAuthProvider>
      <UserRecordProvider>
        <BrowserRouter>
          <Switch>
            <Route path="/" exact component={LandingPage} />
            <Route path="/login" exact component={LoginPage} />
            <Route path="/register" exact component={RegisterPage} />
            <Route path="/password-reset" exact component={PasswordResetPage} />

            <PrivateRoute path="/create-event" component={CreateEventPage} />
            <PrivateRoute
              path="/create-event-plan"
              component={CreateEventPlanPage}
            />
            <PrivateRoute path="/event/:id" component={EventPage} />
            <PrivateRoute path="/event-plans/:id" component={EventPlanPage} />
            <PrivateRoute
              path="/events-finalized/:id"
              component={EventFinalizedPage}
            />
            <PrivateRoute path="/calendar" component={CalendarPage} />
            <PrivateRoute path="/dashboard" component={HomePage} />
            <PrivateRoute path="/profile" component={ProfilePage} />
            <PrivateRoute path="/sample" component={SamplePage} />
            <Route path="*" exact component={NotFoundPage} />
          </Switch>
        </BrowserRouter>
      </UserRecordProvider>
    </UserAuthProvider>
  );
}
