import { useState } from 'react';
import { RadioGroup } from '@headlessui/react';
import { HomeIcon, PlusIcon } from '@heroicons/react/solid';

const team = [
  {
    name: 'Calvin Hawkins',
    email: 'calvin.hawkins@example.com',
    imageUrl:
      'https://images.unsplash.com/photo-1513910367299-bce8d8a0ebf6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    name: 'Bessie Richards',
    email: 'bessie.richards@example.com',
    imageUrl:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    name: 'Floyd Black',
    email: 'floyd.black@example.com',
    imageUrl:
      'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
];
const settings = [
  {
    name: 'Public access',
    description: 'This project would be available to anyone who has the link',
  },
  {
    name: 'Private to Project Members',
    description: 'Only members of this project would be able to access',
  },
  {
    name: 'Private to you',
    description: 'You are the only one able to access this project',
  },
];

// @ts-ignore
function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Example() {
  const [selected, setSelected] = useState(settings[0]);

  return (
    <>
      <main className="max-w-lg mx-auto pt-10 pb-12 px-4 lg:pb-16">
        <form>
          <div className="space-y-6">
            <div>
              <h1 className="text-lg leading-6 font-medium text-gray-900">
                New Event
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Please fill out the following form in order to create a new event!
              </p>
            </div>

            <div>
              <label
                htmlFor="project-name"
                className="block text-sm font-medium text-gray-700"
              >
                Event Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="project-name"
                  id="project-name"
                  className="block w-full shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm border-gray-300 rounded-md"
                  defaultValue="My Event Name"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Event Description
              </label>
              <div className="mt-1">
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  className="block w-full shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm border border-gray-300 rounded-md"
                  defaultValue={''}
                />
              </div>
            </div>

            <div className="flex-1 relative z-0 flex overflow-hidden">
            <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
              {/* Start main area*/}
              <div className="absolute inset-0 py-6 px-4 sm:px-6 lg:px-8">
                <div className="h-full border-2 border-gray-200 border-dashed rounded-lg" />

                <div>
              <label
                htmlFor="startdate"
                className="block text-sm font-medium text-gray-700"
              >
                Start Date
              </label>
              <div className="mt-1">
                <textarea
                  id="startdate"
                  name="startdate"
                  className="block w-full shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm border border-gray-300 rounded-md"
                  defaultValue={''}
                />
              </div>
            </div>

              </div>
              {/* End main area */}
            </main>
            <aside className="hidden relative xl:flex xl:flex-col flex-shrink-0 w-96 border-l border-gray-200 overflow-y-auto">
              {/* Start secondary column (hidden on smaller screens) */}
              <div className="absolute inset-0 py-6 px-4 sm:px-6 lg:px-8">
                <div className="h-full border-2 border-gray-200 border-dashed rounded-lg" />

                <div>
              <label
                htmlFor="starttime"
                className="block text-sm font-medium text-gray-700"
              >
                Start Time
              </label>
              <div className="mt-1">
                <textarea
                  id="starttime"
                  name="starttime"
                  className="block w-full shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm border border-gray-300 rounded-md"
                  defaultValue={''}
                />
              </div>
            </div>

              </div>
              {/* End secondary column */}
            </aside>
          </div>
            
            <div className="space-y-2">
              <div className="space-y-1">
                <label
                  htmlFor="add-team-members"
                  className="block text-sm font-medium text-gray-700"
                >
                  Invited:
                </label>
                <p id="add-team-members-helper" className="sr-only">
                  Search by email address
                </p>
                <div className="flex">
                  <div className="flex-grow">
                    <input
                      type="text"
                      name="add-team-members"
                      id="add-team-members"
                      className="block w-full shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm border-gray-300 rounded-md"
                      placeholder="Email address"
                      aria-describedby="add-team-members-helper"
                    />
                  </div>
                  <span className="ml-3">
                    <button
                      type="button"
                      className="bg-white inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                    >
                      <PlusIcon
                        className="-ml-2 mr-1 h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                      <span>Invite</span>
                    </button>
                  </span>
                </div>
              </div>

              <div className="border-b border-gray-200">
                <div role="list" className="divide-y divide-gray-200">
                  {team.map((person) => (
                    <li key={person.email} className="py-4 flex">
                      <img
                        className="h-10 w-10 rounded-full"
                        src={person.imageUrl}
                        alt=""
                      />
                      <div className="ml-3 flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {person.name}
                        </span>
                        <span className="text-sm text-gray-500">
                          {person.email}
                        </span>
                      </div>
                    </li>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
              >
                Create this event
              </button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}


// import assert from 'assert';
// import moment from 'moment';
// import TimePicker from 'rc-time-picker';
// import React from 'react';
// import Button from 'react-bootstrap/Button';
// import Col from 'react-bootstrap/Col';
// import Container from 'react-bootstrap/Container';
// import Form from 'react-bootstrap/Form';
// import Row from 'react-bootstrap/Row';
// import ReCAPTCHA from 'react-google-recaptcha';
// import { useHistory } from 'react-router-dom';
// import Recaptcha from '../Recaptcha/Recaptcha';
// import GuestList from '../GuestList/GuestList';
// import { EventPlanInfo, TIME_FORMAT } from '../../interfaces';
// import { createEventPlan } from '../../lib/firestore';
// import { useUserContext } from '../../contexts/UserContext';
// import { useUserRecordContext } from '../../contexts/UserRecordContext';

// import './CreateEventPlanForm.css';
// import 'rc-time-picker/assets/index.css';

// /** RO3: copied from wya-api/lib/format-time-string */
// const SUPPORTED_TIME_FORMATS = [
//   'h:mm a',
//   'h:mm A',
//   'hh:mm a',
//   'hh:mm A',
//   'HH:mm',
// ];
// /** End of RO3 */

// type Email = string;

// export default function CreateEventPlanForm(): JSX.Element {
//   const { user } = useUserContext();
//   const { userRecord } = useUserRecordContext();
//   const history = useHistory();
//   const [invitees, updateInvitees] = React.useState<Email[]>([]);
//   const recaptchaRef = React.useRef<ReCAPTCHA>(null);

//   const currentDate = moment().format('YYYY-MM-DD');
//   const [startTimeValue, setStartTimeValue] = React.useState<moment.Moment>(
//     moment().startOf('hour')
//   );
//   const [endTimeValue, setEndTimeValue] = React.useState<moment.Moment>(
//     moment().startOf('hour').add(15, 'minutes')
//   );

//   const onSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     // Fail immediately if no token
//     assert(recaptchaRef.current, 'ReCAPTCHA has not loaded');
//     const token = await recaptchaRef.current.executeAsync();
//     assert(token, 'Missing ReCAPTCHA token');

//     const formData = new FormData(e.target as HTMLFormElement);
//     const formValues = Object.fromEntries(
//       formData.entries()
//     ) as unknown as EventPlanInfo;

//     // We always convert to 24 hour time when storing these time
//     // intervals in firestore
//     formValues.dailyStartTime = moment(
//       formValues.dailyStartTime,
//       SUPPORTED_TIME_FORMATS
//     ).format(TIME_FORMAT.TWENTY_FOUR_HOURS);
//     formValues.dailyEndTime = moment(
//       formValues.dailyEndTime,
//       SUPPORTED_TIME_FORMATS
//     ).format(TIME_FORMAT.TWENTY_FOUR_HOURS);

//     assert(
//       moment(formValues.dailyStartTime, SUPPORTED_TIME_FORMATS, true).isValid()
//     );
//     assert(
//       moment(formValues.dailyEndTime, SUPPORTED_TIME_FORMATS, true).isValid()
//     );

//     const eventPlanData: EventPlanInfo & {
//       invitees: Email[];
//       'g-recaptcha-response': string;
//     } = {
//       ...(formValues as EventPlanInfo),
//       invitees,
//       'g-recaptcha-response': token,
//     };

//     const eventPlanId = await createEventPlan(
//       eventPlanData as EventPlanInfo & {
//         invitees: Email[];
//         'g-recaptcha-response': string;
//       }
//     );
//     console.log('Event plan created: ', eventPlanId);
//     history.push(`/event-plans/${eventPlanId}`);
//   };

//   return (
//     <Container>
//       <Col className="form-container">
//         <Form
//           data-testid="CreateEventPlanForm"
//           onSubmit={onSubmitHandler}
//           className="form-create-event-plan"
//         >
//           <input type="hidden" name="hostId" value={user?.uid} />
//           <h2
//             style={{
//               textAlign: 'left',
//               margin: 0,
//               marginBottom: 25,
//             }}
//           >
//             Let&apos;s create an event plan!
//           </h2>
//           <Row>
//             <Col sm={6}>
//               <Row>
//                 <Form.Group controlId="eventName">
//                   <Form.Label style={{ margin: 0 }}>Name</Form.Label>
//                   <Form.Control
//                     type="text"
//                     placeholder="Name your event"
//                     name="name"
//                     autoComplete="off"
//                   />
//                 </Form.Group>
//               </Row>

//               <Row>
//                 <Form.Group controlId="eventDescription">
//                   <Form.Label style={{ margin: 0 }}>Description</Form.Label>
//                   <Form.Control
//                     as="textarea"
//                     name="description"
//                     style={{ height: '75px' }}
//                     placeholder="Describe your event"
//                     autoComplete="off"
//                   />
//                 </Form.Group>
//               </Row>

//               <Row>
//                 <Col sm={6}>
//                   <Form.Group controlId="eventStartDate">
//                     <Form.Label style={{ margin: 0 }}>Start Date</Form.Label>
//                     <Form.Control
//                       type="date"
//                       placeholder="Event Start"
//                       name="startDate"
//                       min={currentDate}
//                       className="date-picker-input"
//                     />
//                   </Form.Group>
//                 </Col>

//                 <Col sm={6}>
//                   <Form.Group controlId="eventEndDate">
//                     <Form.Label style={{ margin: 0 }}>End Date</Form.Label>
//                     <Form.Control
//                       type="date"
//                       placeholder="Event End"
//                       name="endDate"
//                       min={currentDate}
//                       className="date-picker-input"
//                     />
//                   </Form.Group>
//                 </Col>
//               </Row>
//               <Row>
//                 <Col>
//                   <Form.Label style={{ margin: 0 }}>
//                     Daily Start Time
//                   </Form.Label>
//                   <TimePicker
//                     className="time-picker-input"
//                     placement="bottomRight"
//                     placeholder="Daily start time"
//                     showSecond={false}
//                     minuteStep={15}
//                     value={startTimeValue}
//                     onChange={setStartTimeValue}
//                     name="dailyStartTime"
//                     allowEmpty={false}
//                     use12Hours={
//                       userRecord?.timeFormat === TIME_FORMAT.TWELVE_HOURS
//                     }
//                   />
//                 </Col>
//                 <Col>
//                   <Form.Label style={{ margin: 0 }}>Daily End Time</Form.Label>
//                   <TimePicker
//                     className="time-picker-input"
//                     placement="bottomRight"
//                     placeholder="Daily end time"
//                     showSecond={false}
//                     minuteStep={15}
//                     value={endTimeValue}
//                     onChange={setEndTimeValue}
//                     name="dailyEndTime"
//                     allowEmpty={false}
//                     use12Hours={
//                       userRecord?.timeFormat === TIME_FORMAT.TWELVE_HOURS
//                     }
//                   />
//                 </Col>
//               </Row>
//             </Col>
//             <Col sm={6}>
//               <Row>
//                 <GuestList guests={invitees} updateGuests={updateInvitees} />
//               </Row>
//               <div className="button-container">
//                 <Button type="submit" className="form-button">
//                   Create
//                 </Button>
//               </div>
//             </Col>
//           </Row>

//           <Recaptcha recaptchaRef={recaptchaRef} />
//         </Form>
//       </Col>
//     </Container>
//   );
// }
