import React from 'react';
import Form from 'react-bootstrap/Form';
import { useHistory } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import { v4 as uuid } from 'uuid';
import TimePicker from 'rc-time-picker';
import moment from 'moment';
import ReCAPTCHA from 'react-google-recaptcha';
import Recaptcha from '../Recaptcha/Recaptcha';
import { createEvent } from '../../lib/firestore';
import { useUserContext } from '../../contexts/UserContext';
import GuestList from '../GuestList/GuestList';

import './CreateEventForm.css';
import 'rc-time-picker/assets/index.css';
import { useUserRecordContext } from '../../contexts/UserRecordContext';

export default function CreateEventForm(): JSX.Element {
    const { user } = useUserContext();
    const { userRecord } = useUserRecordContext();

    const history = useHistory();
    const [guests, updateGuests] = React.useState<string[]>([]);
    const recaptchaRef = React.useRef<ReCAPTCHA>(null);

    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
    const yyyy = today.getFullYear();
    const currentDate = String(`${yyyy}-${mm}-${dd}`);
    const start = moment().startOf('hour');
    const end = moment().startOf('hour').add(15, 'minutes');

    const [startTimeValue, setStartTimeValue] =
        React.useState<moment.Moment>(start);
    const [endTimeValue, setEndTimeValue] = React.useState<moment.Moment>(end);

    const onSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        // eslint-disable-next-line
        let formValue = Object.fromEntries(formData.entries()) as any;
        formValue.startTime = moment(formValue.startTime, ['hh:mm A']).format(
            'HH:mm'
        );
        formValue.endTime = moment(formValue.endTime, ['hh:mm A']).format(
            'HH:mm'
        );
        formValue = { ...formValue, guests };

        try {
            await recaptchaRef.current!.executeAsync();
            const eventId = await createEvent(formValue);
            history.push(`/event/${eventId}`);
        } catch (error) {
            // eslint-disable-next-line
            console.error(error);
        }
    };
    return (
        <Container>
            <Col className="form-container">
                <Form
                    data-testid="CreateEventForm"
                    onSubmit={onSubmitHandler}
                    className="form-create-event"
                >
                    <input type="hidden" name="hostId" value={user?.uid} />
                    <input type="hidden" name="eventId" value={uuid()} />
                    <h2
                        style={{
                            textAlign: 'left',
                            margin: 0,
                            marginBottom: 25,
                        }}
                    >
                        Let&apos;s create an event!
                    </h2>
                    <Row>
                        <Col sm={6}>
                            <Row>
                                <Form.Group controlId="eventName">
                                    <Form.Label style={{ margin: 0 }}>
                                        Name
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Name your event"
                                        name="name"
                                        autoComplete="off"
                                    />
                                </Form.Group>
                            </Row>

                            <Row>
                                <Form.Group controlId="eventDescription">
                                    <Form.Label style={{ margin: 0 }}>
                                        Description
                                    </Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        name="description"
                                        style={{ height: '75px' }}
                                        placeholder="Describe your event"
                                        autoComplete="off"
                                    />
                                </Form.Group>
                            </Row>

                            <Row>
                                <Col sm={6}>
                                    <Form.Group controlId="eventStartDate">
                                        <Form.Label style={{ margin: 0 }}>
                                            Start Date
                                        </Form.Label>
                                        <Form.Control
                                            type="date"
                                            placeholder="Event Start"
                                            name="startDate"
                                            min={currentDate}
                                            className="date-picker-input"
                                        />
                                    </Form.Group>
                                </Col>

                                <Col sm={6}>
                                    <Form.Group controlId="eventEndDate">
                                        <Form.Label style={{ margin: 0 }}>
                                            End Date
                                        </Form.Label>
                                        <Form.Control
                                            type="date"
                                            placeholder="Event End"
                                            name="endDate"
                                            min={currentDate}
                                            className="date-picker-input"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Form.Label style={{ margin: 0 }}>
                                        Start Time
                                    </Form.Label>
                                    <TimePicker
                                        className="time-picker-input"
                                        placement="bottomRight"
                                        placeholder="Start time"
                                        showSecond={false}
                                        minuteStep={15}
                                        value={startTimeValue}
                                        onChange={setStartTimeValue}
                                        name="startTime"
                                        allowEmpty={false}
                                        use12Hours={!userRecord?.timeFormat24Hr}
                                    />
                                </Col>
                                <Col>
                                    <Form.Label style={{ margin: 0 }}>
                                        End Time
                                    </Form.Label>
                                    <TimePicker
                                        className="time-picker-input"
                                        placement="bottomRight"
                                        placeholder="End time"
                                        showSecond={false}
                                        minuteStep={15}
                                        value={endTimeValue}
                                        onChange={setEndTimeValue}
                                        name="endTime"
                                        allowEmpty={false}
                                        use12Hours={!userRecord?.timeFormat24Hr}
                                    />
                                </Col>
                            </Row>
                        </Col>
                        <Col sm={6}>
                            <Row>
                                <GuestList
                                    guests={guests}
                                    updateGuests={updateGuests}
                                />
                            </Row>
                            <div className="button-container">
                                <Button type="submit" className="form-button">
                                    Create
                                </Button>
                            </div>
                        </Col>
                    </Row>

                    <Recaptcha recaptchaRef={recaptchaRef} />
                </Form>
            </Col>
        </Container>
    );
}
