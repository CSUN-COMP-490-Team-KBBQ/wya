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
import DashboardPage from '../../pages/DashboardPage/DashboardPage';
import SettingsPage from '../../pages/SettingsPage/SettingsPage';

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

            {/* legacy page */}
            <PrivateRoute path="/create-event" component={CreateEventPage} />
            {/* legacy page */}
            <PrivateRoute
              path="/create-event-plan"
              component={CreateEventPlanPage}
            />
            {/* legacy page */}
            <PrivateRoute path="/event/:id" component={EventPage} />
            {/* legacy page */}
            <PrivateRoute path="/event-plans/:id" component={EventPlanPage} />
            {/* legacy page */}
            <PrivateRoute
              path="/events-finalized/:id"
              component={EventFinalizedPage}
            />
            {/* legacy page */}
            <PrivateRoute path="/calendar" component={CalendarPage} />
            <PrivateRoute path="/dashboard" component={DashboardPage} />
            <PrivateRoute path="/settings" component={SettingsPage} />
            {/* legacy page */}
            <PrivateRoute path="/profile" component={ProfilePage} />
            {/* legacy page */}
            <Route path="*" exact component={NotFoundPage} />
          </Switch>
        </BrowserRouter>
      </UserRecordProvider>
    </UserAuthProvider>
  );
}
