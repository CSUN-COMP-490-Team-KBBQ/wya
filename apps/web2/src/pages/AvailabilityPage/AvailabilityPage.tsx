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

import {
  EventPlanId,
  EventPlanInfo,
  ScheduleSelectorData,
} from '../../interfaces/';

export default function AvailabilityPage() {
  const { pending, userRecord } = useUserRecordContext();

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
          alert('Update Sucessful');
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
