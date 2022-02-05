import assert from 'assert';
import React from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import { useHistory, Link } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';

import Recaptcha from '../Recaptcha/Recaptcha';
import RegisterFormData from '../../interfaces/RegisterFormData';
import { registerUser, logIn } from '../../lib/auth';
import { useUserContext } from '../../contexts/UserContext';

import './RegisterForm.css';

export default function RegisterForm(): JSX.Element {
  const history = useHistory();
  const { user } = useUserContext();

  const recaptchaRef = React.useRef<ReCAPTCHA>(null);

  React.useEffect(() => {
    if (user) {
      // eslint-disable-next-line
      console.log('User already logged in, redirecting to home page');
      history.push('/calendar');
    }
  });

  const registerUserHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const formValue: RegisterFormData = Object.fromEntries(
      formData.entries()
      // eslint-disable-next-line
    ) as any;
    const { email, password } = formValue;

    assert(recaptchaRef.current, 'ReCAPTCHA has not loaded');
    const token = await recaptchaRef.current.executeAsync();

    assert(token, 'Missing ReCAPTCHA token');

    const { data } = await registerUser(formValue);
    // eslint-disable-next-line
    console.log(`User successfully created!`, data);
    await logIn(email, password);
    history.push('/calendar');
  };

  return (
    <Container>
      <Col className="form-container">
        <Form onSubmit={registerUserHandler} className="form-register">
          <Row>
            <Form.Group as={Col} controlId="registerFirstName">
              <Form.Label style={{ margin: 0 }}>First Name</Form.Label>
              <Form.Control type="text" name="firstName" />
            </Form.Group>

            <Form.Group as={Col} controlId="registerLastName">
              <Form.Label style={{ margin: 0 }}>Last Name</Form.Label>
              <Form.Control type="text" name="lastName" />
            </Form.Group>
          </Row>
          <Row>
            <Form.Group controlId="registerEmail">
              <Form.Label style={{ margin: 0 }}>Email</Form.Label>
              <Form.Control type="email" name="email" />
            </Form.Group>
          </Row>
          <Row>
            <Form.Group controlId="registerPassword">
              <Form.Label style={{ margin: 0 }}>Password</Form.Label>
              <Form.Control type="password" name="password" />
            </Form.Group>
          </Row>
          <Button type="submit" className="form-button">
            Register
          </Button>
          <Form.Text>
            <Link className="clickable-link" to="/login">
              Have an account?
            </Link>
          </Form.Text>
          <Recaptcha recaptchaRef={recaptchaRef} />
        </Form>
      </Col>
    </Container>
  );
}
