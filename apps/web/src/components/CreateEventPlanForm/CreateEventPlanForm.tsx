import assert from 'assert';
import moment from 'moment';
import TimePicker from 'rc-time-picker';
import React from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import ReCAPTCHA from 'react-google-recaptcha';
import { useHistory } from 'react-router-dom';
import Recaptcha from '../Recaptcha/Recaptcha';
import GuestList from '../GuestList/GuestList';
import { EventPlanInfo, TIME_FORMAT } from '../../interfaces';
import { useUserRecordContext } from '../../contexts/UserRecordContext';

import './CreateEventPlanForm.css';
import 'rc-time-picker/assets/index.css';
import api from '../../modules/api';

/** RO3: copied from wya-api/lib/format-time-string */
const SUPPORTED_TIME_FORMATS = [
  'h:mm a',
  'h:mm A',
  'hh:mm a',
  'hh:mm A',
  'HH:mm',
];
/** End of RO3 */

type Email = string;

export default function CreateEventPlanForm(): JSX.Element {
  const { userRecord } = useUserRecordContext();
  const history = useHistory();
  const [invitees, updateInvitees] = React.useState<Email[]>([]);
  const recaptchaRef = React.useRef<ReCAPTCHA>(null);

  const currentDate = moment().format('YYYY-MM-DD');
  const [startTimeValue, setStartTimeValue] = React.useState<moment.Moment>(
    moment().startOf('hour')
  );
  const [endTimeValue, setEndTimeValue] = React.useState<moment.Moment>(
    moment().startOf('hour').add(15, 'minutes')
  );

  const onSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Fail immediately if no token
    assert(recaptchaRef.current, 'ReCAPTCHA has not loaded');
    const token = await recaptchaRef.current.executeAsync();
    assert(token, 'Missing ReCAPTCHA token');

    const formData = new FormData(e.target as HTMLFormElement);
    const formValues = Object.fromEntries(
      formData.entries()
    ) as unknown as EventPlanInfo;

    // We always convert to 24 hour time when storing these time
    // intervals in firestore
    formValues.dailyStartTime = moment(
      formValues.dailyStartTime,
      SUPPORTED_TIME_FORMATS
    ).format(TIME_FORMAT.TWENTY_FOUR_HOURS);
    formValues.dailyEndTime = moment(
      formValues.dailyEndTime,
      SUPPORTED_TIME_FORMATS
    ).format(TIME_FORMAT.TWENTY_FOUR_HOURS);

    assert(
      moment(formValues.dailyStartTime, SUPPORTED_TIME_FORMATS, true).isValid()
    );
    assert(
      moment(formValues.dailyEndTime, SUPPORTED_TIME_FORMATS, true).isValid()
    );

    const eventPlanData: EventPlanInfo & {
      invitees: Email[];
      'g-recaptcha-response': string;
    } = {
      ...(formValues as EventPlanInfo),
      invitees,
      'g-recaptcha-response': token,
    };

    const {
      data: {
        data: [eventPlanId],
      },
    } = await api.post('/event-plans/create', JSON.stringify(eventPlanData));

    console.log('Event plan created: ', eventPlanId);

    history.push(`/event-plans/${eventPlanId}`);
  };

  return (
    <Container>
      <Col className="form-container">
        <Form
          data-testid="CreateEventPlanForm"
          onSubmit={onSubmitHandler}
          className="form-create-event-plan"
        >
          <h2
            style={{
              textAlign: 'left',
              margin: 0,
              marginBottom: 25,
            }}
          >
            Let&apos;s create an event plan!
          </h2>
          <Row>
            <Col sm={6}>
              <Row>
                <Form.Group controlId="eventName">
                  <Form.Label style={{ margin: 0 }}>Name</Form.Label>
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
                  <Form.Label style={{ margin: 0 }}>Description</Form.Label>
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
                    <Form.Label style={{ margin: 0 }}>Start Date</Form.Label>
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
                    <Form.Label style={{ margin: 0 }}>End Date</Form.Label>
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
                    Daily Start Time
                  </Form.Label>
                  <TimePicker
                    className="time-picker-input"
                    placement="bottomRight"
                    placeholder="Daily start time"
                    showSecond={false}
                    minuteStep={15}
                    value={startTimeValue}
                    onChange={setStartTimeValue}
                    name="dailyStartTime"
                    allowEmpty={false}
                    use12Hours={
                      userRecord?.timeFormat === TIME_FORMAT.TWELVE_HOURS
                    }
                  />
                </Col>
                <Col>
                  <Form.Label style={{ margin: 0 }}>Daily End Time</Form.Label>
                  <TimePicker
                    className="time-picker-input"
                    placement="bottomRight"
                    placeholder="Daily end time"
                    showSecond={false}
                    minuteStep={15}
                    value={endTimeValue}
                    onChange={setEndTimeValue}
                    name="dailyEndTime"
                    allowEmpty={false}
                    use12Hours={
                      userRecord?.timeFormat === TIME_FORMAT.TWELVE_HOURS
                    }
                  />
                </Col>
              </Row>
            </Col>
            <Col sm={6}>
              <Row>
                <GuestList guests={invitees} updateGuests={updateInvitees} />
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
