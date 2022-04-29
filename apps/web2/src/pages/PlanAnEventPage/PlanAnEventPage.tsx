import assert from 'assert';
import React from 'react';
import moment from 'moment';
import TimePicker from 'rc-time-picker';
import ReCAPTCHA from 'react-google-recaptcha';
import { useHistory } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/solid';
import { ClockIcon } from '@heroicons/react/outline';

import Recaptcha from '../../components/Recaptcha/Recaptcha';
import Sidebar from '../../components/Sidebar/Sidebar';
import {
  EventPlanInfo,
  TIME_FORMAT,
  SUPPORTED_TIME_FORMATS,
} from '../../interfaces';

import { useUserContext } from '../../contexts/UserContext';
import { useUserRecordContext } from '../../contexts/UserRecordContext';

import api from '../../modules/api';

type Email = string;

export default function PlanAnEventPage() {
  const { user } = useUserContext();
  const { userRecord } = useUserRecordContext();
  const history = useHistory();
  const [invitees, updateInvitees] = React.useState<Email[]>([]);
  const recaptchaRef = React.useRef<ReCAPTCHA>(null);
  const inputRef = React.useRef<HTMLInputElement>();

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

    console.log(eventPlanData);

    const {
      data: {
        data: [eventPlanId],
      },
    } = await api.post('/event-plans/create', JSON.stringify(eventPlanData));

    console.log('Event plan created: ', eventPlanId);

    history.push(`/event-plans/${eventPlanId}`);
  };

  const AddGuestHandler = () => {
    if (inputRef.current) {
      const newGuestUID = inputRef.current.value;
      updateInvitees([...invitees, newGuestUID]);
      inputRef.current.value = '';
    }
  };

  const onRemoveHandler = (index: number) => {
    // removes item at index and modifies guests in place
    invitees.splice(index, 1);
    updateInvitees([...invitees]);
  };

  return (
    <Sidebar>
      <main className="max-w-lg mx-auto pt-20 pb-12 px-4 lg:pb-16">
        <form onSubmit={onSubmitHandler}>
          <input type="hidden" name="hostId" value={user?.uid} />
          <div className="space-y-6">
            <div>
              <h1 className="text-lg leading-6 font-medium text-gray-900">
                Event Settings
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Let’s get started by filling in the information below to create
                your new event plan.
              </p>
            </div>

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Event Name
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="name"
                  id="name"
                  className="block w-full shadow-sm focus:ring-blue-500 border focus:border-blue-500 sm:text-sm border-gray-300 rounded-md p-2"
                  defaultValue="Nero Event"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <div className="mt-1">
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  className="block w-full shadow-sm focus:ring-blue-500 border focus:border-blue-500 sm:text-sm border border-gray-300 rounded-md p-2"
                  defaultValue={''}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="time"
                className="block text-sm font-medium text-gray-700"
              >
                Days
              </label>
              <div className="grid sm:grid-cols-2 gap-2">
                <div className="col-span-1">
                  <input
                    type="date"
                    name="startDate"
                    id="startDate"
                    className="block w-full shadow-sm focus:ring-blue-500 border focus:border-blue-500 sm:text-sm border-gray-300 rounded-md p-2"
                    min={currentDate}
                    placeholder="From"
                  />
                </div>
                <div className="col-span-1 sm:col-start-2">
                  <input
                    type="date"
                    name="endDate"
                    id="endDate"
                    className="block w-full shadow-sm focus:ring-blue-500 border focus:border-blue-500 sm:text-sm border-gray-300 rounded-md p-2"
                    min={currentDate}
                    placeholder="To"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="time"
                className="block text-sm font-medium text-gray-700"
              >
                Time
              </label>
              <div className="grid sm:grid-cols-2 gap-2 sm:w-3/4">
                <div className="col-span-1">
                  <TimePicker
                    className="time-picker-input"
                    placement="bottomLeft"
                    placeholder="Daily start time"
                    inputIcon={
                      <i
                        style={{
                          color: '#aaa',
                        }}
                      >
                        <ClockIcon
                          style={{
                            position: 'absolute',
                            width: '24px',
                            right: '5px',
                            top: '7px',
                            bottom: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        />
                      </i>
                    }
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
                </div>
                <div className="col-span-1 sm:col-start-2">
                  <TimePicker
                    className="time-picker-input"
                    placement="bottomLeft"
                    placeholder="Daily end time"
                    inputIcon={
                      <i
                        style={{
                          color: '#aaa',
                        }}
                      >
                        <ClockIcon
                          style={{
                            position: 'absolute',
                            width: '24px',
                            right: '5px',
                            top: '7px',
                            bottom: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        />
                      </i>
                    }
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
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="space-y-1">
                <label
                  htmlFor="add-team-members"
                  className="block text-sm font-medium text-gray-700"
                >
                  Add People
                </label>
                <div className="flex">
                  <div className="flex-grow">
                    <input
                      type="email"
                      className="block w-full shadow-sm focus:ring-blue-500 border focus:border-blue-500 sm:text-sm border-gray-300 rounded-md p-2"
                      placeholder="Email address"
                      pattern=".+@globex\.com"
                      ref={(node: HTMLInputElement) => {
                        inputRef.current = node;
                      }}
                    />
                  </div>
                  <span className="ml-3">
                    <button
                      type="button"
                      className="bg-white inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={AddGuestHandler}
                    >
                      <PlusIcon
                        className="-ml-2 mr-1 h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                      <span>Add</span>
                    </button>
                  </span>
                </div>
              </div>

              <div className="border-b border-gray-200">
                <div role="list" className="divide-y divide-gray-200">
                  {invitees.map((email, index) => (
                    <li key={email} className="py-4 flex justify-between">
                      <div className="ml-3 flex flex-col">
                        <span className="text-sm text-gray-500">{email}</span>
                      </div>
                      <span className="ml-4 flex-shrink-0">
                        <button
                          type="button"
                          className="bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          onClick={() => onRemoveHandler(index)}
                        >
                          Remove
                        </button>
                      </span>
                    </li>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Create this event
              </button>
            </div>
          </div>

          <Recaptcha recaptchaRef={recaptchaRef} />
        </form>
      </main>
    </Sidebar>
  );
}
