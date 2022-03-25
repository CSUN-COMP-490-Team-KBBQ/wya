import React from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import { useHistory, Link } from 'react-router-dom';
import { logIn } from '../../lib/auth';
import { useUserContext } from '../../contexts/UserContext';

import './LoginForm.css';

export default function LoginForm(): JSX.Element {
  const history = useHistory();
  const { user } = useUserContext();
  React.useEffect(() => {
    if (user) {
      history.push('/calendar');
    }
  }, [user, history]);

  const logInHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const formValue = Object.fromEntries(formData.entries());
    // eslint-disable-next-line
    console.log('USER_LOGIN', formValue);
    const { email, password } = formValue;
    logIn(email as string, password as string)
      .then(({ uid }) => {
        // eslint-disable-next-line
        console.log(`Logged in as user ${uid}`);
        history.push('/calendar');
      })
      // eslint-disable-next-line
      .catch(console.error);
  };

  return (
    <Container>
      <Col className="form-container">
        <Form onSubmit={logInHandler} className="form-login">
          <Form.Group as={Row} controlId="loginEmail">
            <Form.Label style={{ margin: 0 }}>Email</Form.Label>
            <Col>
              <Form.Control type="email" name="email" className="form-input" />
            </Col>
          </Form.Group>

          <Form.Group as={Row} controlId="loginPassword">
            <Form.Label style={{ margin: 0 }}>Password</Form.Label>
            <Col>
              <Form.Control
                type="password"
                name="password"
                className="form-input"
              />
            </Col>
            <Form.Text>
              <Link className="clickable-link" to="/password-reset">
                Forgot your password?
              </Link>
            </Form.Text>
          </Form.Group>
          <Button type="submit" className="form-button">
            Log in
          </Button>
          <Form.Text>
            <Link className="clickable-link" to="/register">
              Don&apos;t have an account?
            </Link>
          </Form.Text>
        </Form>
      </Col>
    </Container>
  );
}
