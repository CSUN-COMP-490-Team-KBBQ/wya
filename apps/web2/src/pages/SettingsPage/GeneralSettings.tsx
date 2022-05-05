import { useState, useEffect } from 'react';
import { Switch } from '@headlessui/react';

import { useUserRecordContext } from '../../contexts/UserRecordContext';

import { TIME_FORMAT } from '../../interfaces';

import { updateUserTimeFormat } from '../../lib/firestore';

// @ts-ignore
function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function GeneralSettings() {
  const { userRecord } = useUserRecordContext();
  const [standardTimeFormatEnabled, setStandardTimeFormatEnabled] =
    useState(true);

  useEffect(() => {
    if (userRecord) {
      setStandardTimeFormatEnabled(userRecord.timeFormat === 'HH:mm');
    }
  }, [userRecord]);

  const handleStandardTimeFormatChange = (enabled: boolean) => {
    if (userRecord) {
      const { uid } = userRecord;
      const intendedTimeFormat = enabled
        ? TIME_FORMAT.TWENTY_FOUR_HOURS
        : TIME_FORMAT.TWELVE_HOURS;
      updateUserTimeFormat(uid, intendedTimeFormat)
        .then(() => {
          setStandardTimeFormatEnabled(intendedTimeFormat === 'HH:mm');
        })
        .catch(console.error);
    }
  };

  return (
    <>
      {/* Description list with inline editing */}
      {/* Profile */}
      <div className="mt-10 divide-y divide-gray-200">
        <div className="space-y-1">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Profile
          </h3>
          <p className="max-w-2xl text-sm text-gray-500">
            This information will be displayed publicly so be careful what you
            share.
          </p>
        </div>
        <div className="mt-6">
          <dl className="divide-y divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 items-center">
              <dt className="text-sm font-medium text-gray-500">Name</dt>
              <dd className="mt-1 flex text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <span className="flex-grow">
                  {userRecord?.firstName} {userRecord?.lastName}
                </span>
                <span className="ml-4 flex-shrink-0">
                  <button
                    type="button"
                    className="bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Update
                  </button>
                </span>
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:pt-5 items-center">
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 flex text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <span className="flex-grow">{userRecord?.email}</span>
                <span className="ml-4 flex-shrink-0">
                  <button
                    type="button"
                    className="bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Update
                  </button>
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </div>
      {/* Account */}
      <div className="mt-10 divide-y divide-gray-200">
        <div className="space-y-1">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Account
          </h3>
          <p className="max-w-2xl text-sm text-gray-500">
            Manage how information is displayed on your account.
          </p>
        </div>
        <div className="mt-6">
          <dl className="divide-y divide-gray-200">
            <Switch.Group
              as="div"
              className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:pt-5 items-center"
            >
              <Switch.Label
                as="dt"
                className="text-sm font-medium text-gray-500"
                passive
              >
                24-Hour time format
              </Switch.Label>
              <dd className="mt-1 flex text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <Switch
                  checked={standardTimeFormatEnabled}
                  onChange={handleStandardTimeFormatChange}
                  className={classNames(
                    standardTimeFormatEnabled ? 'bg-blue-600' : 'bg-gray-200',
                    'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-auto'
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={classNames(
                      standardTimeFormatEnabled
                        ? 'translate-x-5'
                        : 'translate-x-0',
                      'inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
                    )}
                  />
                </Switch>
              </dd>
            </Switch.Group>
          </dl>
        </div>
      </div>
    </>
  );
}
