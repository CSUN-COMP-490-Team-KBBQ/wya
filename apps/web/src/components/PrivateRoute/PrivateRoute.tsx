import React from 'react';
import { Route, Redirect, RouteProps } from 'react-router-dom';
import PageSpinner from '../PageSpinner/PageSpinner';
import { useUserContext } from '../../contexts/UserContext';
import { useUserRecordContext } from '../../contexts/UserRecordContext';
import './PrivateRoute.css';

export default function PrivateRoute(props: RouteProps): JSX.Element {
  const { path, component } = props;

  // Private route should be pending until a context is determined
  const [pending, setPending] = React.useState<boolean>(true);

  const { user } = useUserContext();
  const { pending: userRecordPending } = useUserRecordContext();

  // If user then no longer pending
  React.useEffect(() => {
    setPending(!user);
  }, [user]);

  /**
   * If pending then we show page spinner.
   * If user then we show private component.
   * Else redirect to HomePage.
   */
  if (pending || userRecordPending) {
    return <PageSpinner />;
  }
  if (user) {
    return <Route path={path} exact component={component} />;
  }
  return <Redirect to="/" />;
}
