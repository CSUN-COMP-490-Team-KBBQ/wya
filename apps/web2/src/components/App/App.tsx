import { Route, Switch, BrowserRouter } from 'react-router-dom';

import LoginPage from '../../pages/LoginPage/LoginPage';
import RegisterPage from '../../pages/RegisterPage/RegisterPage';
import PrivateRoute from '../PrivateRoute/PrivateRoute';
import PasswordResetPage from '../../pages/PasswordResetPage/PasswordResetPage';
import FriendsPage from '../../pages/FriendsPage/FriendsPage';
import NotFoundPage from '../../pages/NotFoundPage/NotFoundPage';
import { UserAuthProvider } from '../../contexts/UserContext';
import { UserRecordProvider } from '../../contexts/UserRecordContext';

import 'bootstrap/dist/css/bootstrap.min.css';
import LandingPage from '../../pages/LandingPage/LandingPage';
import DashboardPage from '../../pages/DashboardPage/DashboardPage';
import PlanAnEventPage from '../../pages/PlanAnEventPage/PlanAnEventPage';
import SettingsPage from '../../pages/SettingsPage/SettingsPage';
import AvailabilityPage from '../../pages/AvailabilityPage/AvailabilityPage';

// Legacy
import EventPlanPage from '../../pages/EventPlanPage/EventPlanPage';
import EventPage from '../../pages/EventFinalizedPage/EventPage';

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

            <PrivateRoute path="/dashboard" component={DashboardPage} />

            <PrivateRoute path="/plan-event" component={PlanAnEventPage} />
            <PrivateRoute path="/friends" component={FriendsPage} />
            <PrivateRoute path="/availability" component={AvailabilityPage} />

            <PrivateRoute path="/event-plans/:id" component={EventPlanPage} />
            <PrivateRoute path="/events/:id" component={EventPage} />

            <PrivateRoute path="/settings/general" component={SettingsPage} />
            <PrivateRoute path="/settings/password" component={SettingsPage} />

            {/* legacy page */}
            <Route path="*" exact component={NotFoundPage} />
          </Switch>
        </BrowserRouter>
      </UserRecordProvider>
    </UserAuthProvider>
  );
}
