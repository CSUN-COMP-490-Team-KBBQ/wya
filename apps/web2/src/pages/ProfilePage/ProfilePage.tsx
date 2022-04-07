import React from 'react';
import Alert from 'react-bootstrap/Alert';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Toggle from 'react-toggle';

import ChangePasswordForm from '../../components/ChangePasswordForm/ChangePasswordForm';
import Page from '../../components/Page/Page';
import { useUserContext } from '../../contexts/UserContext';
import { useUserRecordContext } from '../../contexts/UserRecordContext';
import { logIn, changePassword } from '../../lib/auth';
import { updateUserTimeFormat } from '../../lib/firestore';
import { TIME_FORMAT } from '../../interfaces';

import './ProfilePage.css';
import 'react-toggle/style.css';

export default function ProfilePage(): JSX.Element {
  const { user } = useUserContext();
  const { userRecord } = useUserRecordContext();
  const [displaySuccess, setDisplaySuccess] = React.useState<string>('');
  const [displayError, setDisplayError] = React.useState<string>('');

  const [timeFormat, setTimeFormat] = React.useState<string>(
    TIME_FORMAT.TWELVE_HOURS
  );

  React.useEffect(() => {
    if (userRecord) {
      setTimeFormat(userRecord.timeFormat);
    }
  }, [userRecord]);

  const DisplayPasswordChangeForm = (): JSX.Element => {
    if (displayError.length > 0 && displaySuccess.length === 0) {
      return (
        <div>
          <Alert id="displayMessage" variant="danger">
            {displayError}
          </Alert>
          <ChangePasswordForm />
        </div>
      );
    }

    if (displaySuccess.length > 0) {
      return (
        <div>
          <Alert id="displayMessage" variant="success">
            {displaySuccess}
          </Alert>
          <ChangePasswordForm />
        </div>
      );
    }

    return <ChangePasswordForm />;
  };

  const handleTimeFormatToggle = () => {
    if (userRecord) {
      const { uid, timeFormat } = userRecord;
      const intendedTimeFormat =
        timeFormat === TIME_FORMAT.TWELVE_HOURS
          ? TIME_FORMAT.TWENTY_FOUR_HOURS
          : TIME_FORMAT.TWELVE_HOURS;
      updateUserTimeFormat(uid, intendedTimeFormat)
        .then(() => {
          setTimeFormat(intendedTimeFormat);
        })
        .catch(console.error);
    }
  };

  const ShowChangeDisplayForm = (): JSX.Element => {
    return (
      <div id="toggleContent">
        <Toggle
          defaultChecked={timeFormat === TIME_FORMAT.TWENTY_FOUR_HOURS}
          icons={false}
          onChange={handleTimeFormatToggle}
        />
        <p>Use 24-Hour Clock</p>
      </div>
    );
  };

  const onSubmitHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const formValue = Object.fromEntries(formData.entries());
    const { oldPassword, newPassword } = formValue;

    if (newPassword === oldPassword) {
      setDisplayError('New password cannot be the same as old password!');
    } else {
      // eslint-disable-next-line
      logIn(user!.email as string, oldPassword as string)
        .then(() => {
          changePassword(newPassword as string)
            .then(() => {
              setDisplaySuccess('Password successfully updated!');
            })
            .catch((err) => {
              const errorResponse = `Error: ${err.code}`;
              setDisplayError(errorResponse);
            });
        })
        .catch((err) => {
          const errorResponse = `Error: ${err.code}`;
          setDisplayError(errorResponse);
        });
    }
  };

  return (
    <Page>
      <Container id="profilePageContainer">
        <Row>
          <Form onSubmit={onSubmitHandler} className="change-password-form">
            <h2>Change Password</h2>
            <hr />
            <DisplayPasswordChangeForm />
          </Form>
        </Row>
        <Row id="changeDisplayRow">
          <Form className="change-display-form">
            <h2>Display</h2>
            <hr />
            <ShowChangeDisplayForm />
          </Form>
        </Row>
      </Container>
    </Page>
  );
}
