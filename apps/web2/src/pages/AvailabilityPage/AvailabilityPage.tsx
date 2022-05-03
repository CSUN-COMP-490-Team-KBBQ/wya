import React from 'react';

import AvailabilityScheduleSelector from '../../components/AvailabilityScheduleSelector/AvailabilityScheduleSelector';
import LandingPage from '../LandingPage/LandingPage';
import { useUserRecordContext } from '../../contexts/UserRecordContext';

import Sidebar from '../../components/Sidebar/Sidebar';
import PageSpinner from '../../components/PageSpinner/PageSpinner';

import {
  getDocSnapshot$,
  updateCalendarAvailability,
} from '../../lib/firestore';

import {
  convertUserAvailabilityDateArrayToTimestampArray,
  createScheduleSelectorData,
} from '../../lib/availability';

import { ScheduleSelectorData } from '../../interfaces/';

import { CheckCircleIcon, XIcon } from '@heroicons/react/solid';

import { Fragment } from 'react';
import { Transition } from '@headlessui/react';

export default function AvailabilityPage() {
  const { pending, userRecord } = useUserRecordContext();
  const [show, setShow] = React.useState<boolean>(false);

  const [scheduleSelectorData, setScheduleSelectorData] =
    React.useState<ScheduleSelectorData>();
  const [userAvailabilityData, setUserAvailabilityData] = React.useState<
    Date[]
  >([]);
  const onClickScheduleSelectorHandle = (newSchedule: Date[]) => {
    setUserAvailabilityData(newSchedule);
  };

  const onClickClearHandle = () => {
    setUserAvailabilityData([]);
  };

  const onClickResetHandle = () => {
    if (scheduleSelectorData) {
      setUserAvailabilityData(scheduleSelectorData?.scheduleData);
    }
  };

  const onClickUpdateHandle = () => {
    if (userAvailabilityData && userRecord) {
      // converting to array number for firestore upload
      const convertedUserAvailabilityData =
        convertUserAvailabilityDateArrayToTimestampArray(userAvailabilityData);

      updateCalendarAvailability(convertedUserAvailabilityData, userRecord.uid)
        .then(() => {
          //alert('Update Sucessful');
          setShow(true);
        })
        // eslint-disable-next-line
        .catch(console.error);
    }
  };

  // Observe user availability
  React.useEffect(() => {
    if (userRecord) {
      const { uid } = userRecord;

      getDocSnapshot$(`/users/${uid}/availabilities/schedule-selector`, {
        next: (scheduleSelectorDocSnapshot) => {
          if (scheduleSelectorDocSnapshot.exists()) {
            const { data: scheduleSelectorAvailability } =
              scheduleSelectorDocSnapshot.data();

            const scheduleSelectorData: ScheduleSelectorData =
              createScheduleSelectorData(
                scheduleSelectorAvailability ?? [],
                userRecord.timeFormat
              );

            setScheduleSelectorData(scheduleSelectorData);

            setUserAvailabilityData(scheduleSelectorData.scheduleData);
          }
        },
      });
    }
  }, [userRecord]);

  if (pending) {
    return <PageSpinner />;
  }

  if (userRecord) {
    return (
      <Sidebar>
        <div className="flex-1 relative z-0 flex overflow-hidden">
          <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
            <div className="max-w-4xl mx-auto flex flex-col md:px-8 xl:px-0">
              <main className="flex-1">
                <div className="relative max-w-4xl mx-auto md:px-8 xl:px-0">
                  <div className="pt-10 pb-16">
                    <div className="px-4 sm:px-6 md:px-0">
                      <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
                        Availability
                      </h1>
                      {userRecord && scheduleSelectorData !== undefined ? (
                        <div className="grid-rows-3">
                          <div>
                            <AvailabilityScheduleSelector
                              startTime={0}
                              endTime={24}
                              scheduleData={userAvailabilityData}
                              dateFormat="dddd"
                              days={7}
                              startDate={new Date('January 04, 1970')}
                              handleChange={onClickScheduleSelectorHandle}
                              timeFormat={scheduleSelectorData.timeFormat}
                            />
                          </div>
                          <div className="inline-flex mt-3">
                            <button
                              onClick={onClickResetHandle}
                              className="ml-3 justify-center py-2 px-4 border border-cyan-700 shadow-sm text-sm font-medium rounded-md text-cyan-700 hover:bg-cyan-400 hover:text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              Reset
                            </button>
                            <button
                              onClick={onClickClearHandle}
                              className="ml-3 justify-center py-2 px-4 border border-blue-600 shadow-sm text-sm font-medium rounded-md text-blue-600 hover:bg-blue-400 hover:text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              Clear
                            </button>
                            <button
                              onClick={onClickUpdateHandle}
                              className="ml-3 justify-center py-2 px-4 border border-green-700 shadow-sm text-sm font-medium rounded-md text-green-700 hover:bg-green-400 hover:text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              Update
                            </button>
                          </div>
                          <>
                            {/* Global notification live region, render this permanently at the end of the document */}
                            <div
                              aria-live="assertive"
                              className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start"
                            >
                              <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
                                {/* Notification panel, dynamically insert this into the live region when it needs to be displayed */}
                                <Transition
                                  show={show}
                                  as={Fragment}
                                  enter="transform ease-out duration-300 transition"
                                  enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
                                  enterTo="translate-y-0 opacity-100 sm:translate-x-0"
                                  leave="transition ease-in duration-100"
                                  leaveFrom="opacity-100"
                                  leaveTo="opacity-0"
                                >
                                  <div className="max-w-sm w-full bg-green-200 shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden">
                                    <div className="rounded-md bg-green-50 p-4">
                                      <div className="flex">
                                        <div className="flex-shrink-0">
                                          <CheckCircleIcon
                                            className="h-5 w-5 text-green-400"
                                            aria-hidden="true"
                                          />
                                        </div>
                                        <div className="ml-3">
                                          <p className="text-sm font-medium text-green-800">
                                            Successfully updated!
                                          </p>
                                        </div>
                                        <div className="ml-auto pl-3">
                                          <div className="-mx-1.5 -my-1.5">
                                            <button
                                              className="inline-flex bg-green-50 rounded-md p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-50 focus:ring-green-600"
                                              onClick={() => {
                                                setShow(false);
                                              }}
                                            >
                                              <span className="sr-only">
                                                Close
                                              </span>
                                              <XIcon
                                                className="h-5 w-5"
                                                aria-hidden="true"
                                              />
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </Transition>
                              </div>
                            </div>
                          </>
                        </div>
                      ) : (
                        <></>
                      )}
                    </div>
                  </div>
                </div>
              </main>
            </div>
          </main>
        </div>
      </Sidebar>
    );
  }
  return <LandingPage />;
}
