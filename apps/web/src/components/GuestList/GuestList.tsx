import React from 'react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import ListGroup from 'react-bootstrap/ListGroup';
import Row from 'react-bootstrap/Row';
import { v4 as uuid } from 'uuid';

import './GuestList.css';

type GuestListItemProps = {
    index: number;
    guest: string;
    onRemoveHandler: (index: number) => void;
};

function GuestListItem({
    guest,
    onRemoveHandler,
    index,
}: GuestListItemProps): JSX.Element {
    return (
        <div className="guests-list-item">
            <div>{guest}</div>
            <div
                className="container-icon-remove"
                onClick={() => {
                    onRemoveHandler(index);
                }}
                aria-hidden="true"
            >
                <i className="bi bi-dash-square-fill icon-remove" />
            </div>
        </div>
    );
}

interface GuestListProps {
    guests: string[];
    updateGuests: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function GuestList({
    guests,
    updateGuests,
}: GuestListProps): JSX.Element {
    const inputRef = React.useRef<HTMLInputElement>();
    const onClickHandler = () => {
        if (inputRef.current) {
            const newGuestUID = inputRef.current.value;
            updateGuests([...guests, newGuestUID]);
            inputRef.current.value = '';
        }
    };

    const onRemoveHandler = (index: number) => {
        // removes item at index and modifies guests in place
        guests.splice(index, 1);
        updateGuests([...guests]);
    };

    return (
        <Container fluid>
            <Form.Label style={{ margin: 0 }}>Guest List</Form.Label>
            <Card data-testid="guests-list">
                <Card.Body>
                    <Row style={{ marginLeft: 0, marginRight: 0 }}>
                        <ListGroup id="group-list" style={{ paddingRight: 0 }}>
                            {guests.length > 0 ? (
                                guests.map((guest: string, index: number) => (
                                    <ListGroup.Item key={uuid()}>
                                        <GuestListItem
                                            guest={guest}
                                            index={index}
                                            onRemoveHandler={onRemoveHandler}
                                        />
                                    </ListGroup.Item>
                                ))
                            ) : (
                                <ListGroup.Item
                                    style={{
                                        display: 'flex',
                                        height: '100%',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                >
                                    <span style={{ fontStyle: 'italic' }}>
                                        Empty&nbsp;
                                    </span>
                                    <span>😔</span>
                                </ListGroup.Item>
                            )}
                        </ListGroup>
                    </Row>
                    <Row style={{ marginLeft: 0, marginRight: 0 }}>
                        <Col sm={10} style={{ paddingLeft: 0 }}>
                            <Form.Group>
                                <Form.Label style={{ margin: 0 }}>
                                    Email
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Invite a guest"
                                    autoComplete="off"
                                    ref={(node: HTMLInputElement) => {
                                        inputRef.current = node;
                                    }}
                                />
                            </Form.Group>
                        </Col>
                        <Col
                            sm={2}
                            className="container-button-invite"
                            style={{ paddingLeft: 0, paddingRight: 0 }}
                        >
                            <Button
                                className="guest-invite-button"
                                type="button"
                                onClick={onClickHandler}
                            >
                                Invite
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </Container>
    );
}
