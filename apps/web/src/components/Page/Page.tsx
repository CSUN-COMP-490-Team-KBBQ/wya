// Will be converted to PrivatePage which will need auth to visit
// Dashboard layout - sidebar, body will have access to:
// > Main (events, calendar)
// > Settings
// > Events (Planned and Finalized)

import React from 'react';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Image from 'react-bootstrap/Image';
import Button from 'react-bootstrap/Button';
import Header from '../Header/Header';
import logo from '../../assets/wya-logo.png';
import { useUserContext } from '../../contexts/UserContext';
import { logOut } from '../../modules/firebase/auth';
import './Page.css';
import '../../index.css';

const Page: React.FC = ({ children }): JSX.Element => {
  const { user } = useUserContext();
  return (
    <>
      <Navbar className="topnav">
        <Container fluid>
          <Navbar.Brand href={user ? '/calendar' : '/'}>
            <Image src={logo} fluid style={{ height: '60px' }} />
          </Navbar.Brand>
          <Header>
            {user ? (
              <>
                <Nav.Link href="/calendar">Calendar</Nav.Link>
                <Nav.Link href="/create-event">Create an event</Nav.Link>
                <Nav.Link href="/create-event-plan">
                  Create an event plan
                </Nav.Link>
                <Nav.Link href="/profile">Profile</Nav.Link>

                <Nav.Item>
                  <Button variant="danger" onClick={logOut}>
                    Log out
                  </Button>
                </Nav.Item>
              </>
            ) : (
              <Container
                style={{
                  display: 'flex',
                  flexGrow: 1,
                  justifyContent: 'flex-end',
                }}
              >
                <Nav.Link href="/login">Log in</Nav.Link>
              </Container>
            )}
          </Header>
        </Container>
      </Navbar>
      {children}
    </>
  );
};

export default Page;
