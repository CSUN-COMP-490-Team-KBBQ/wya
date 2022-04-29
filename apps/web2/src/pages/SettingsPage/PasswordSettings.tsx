import React from 'react';
import { XCircleIcon, CheckCircleIcon } from '@heroicons/react/solid';

import { useUserContext } from '../../contexts/UserContext';
import { logIn, changePassword } from '../../lib/auth';

export default function PasswordSettings() {
  const { user } = useUserContext();
  const [displaySuccess, setDisplaySuccess] = React.useState<string>('');
  const [displayError, setDisplayError] = React.useState<string>('');

  const DisplayPasswordChangeForm = (): JSX.Element => {
    if (displayError.length > 0 && displaySuccess.length === 0) {
      return (
        <div className="rounded-md bg-red-50 p-4 sm:mx-auto">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircleIcon
                className="h-5 w-5 text-red-400"
                aria-hidden="true"
              />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                There was an error with your submission
              </h3>
              <div className="mt-2 text-sm text-red-700">{displayError}</div>
            </div>
          </div>
        </div>
      );
    }

    if (displaySuccess.length > 0) {
      return (
        <div className="rounded-md bg-green-50 p-4 sm:mx-auto">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircleIcon
                className="h-5 w-5 text-green-400"
                aria-hidden="true"
              />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Password was successfully changed
              </h3>
              <div className="mt-2 text-sm text-green-700">{displayError}</div>
            </div>
          </div>
        </div>
      );
    }

    return <></>;
  };

  // TODO: clear input fields on successful submission
  const onSubmitHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const formValue = Object.fromEntries(formData.entries());
    const { currentPassword, newPassword, confirmNewPassword } = formValue;

    if (newPassword === currentPassword) {
      setDisplayError(
        'New password must be different from the current password!'
      );
    } else if (currentPassword !== confirmNewPassword) {
      setDisplayError('New password confirmation failed!');
    } else {
      // eslint-disable-next-line
      logIn(user!.email as string, currentPassword as string)
        .then(() => {
          changePassword(newPassword as string)
            .then(() => {
              setDisplaySuccess('Password successfully updated!');
            })
            .catch((err) => {
              const errorResponse = `Error: ${err.code}`;
              setDisplayError(errorResponse);
            });
        })
        .catch((err) => {
          const errorResponse = `Error: ${err.code}`;
          setDisplayError(errorResponse);
        });
    }
  };

  return (
    <>
      {/* Change Password */}
      <div className="mt-10 divide-y divide-gray-200">
        <div className="space-y-1">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Change Password
          </h3>
          <p className="max-w-2xl text-sm text-gray-500">
            Manage password information for your account.
          </p>
        </div>

        {/* Alert Banner */}
        <DisplayPasswordChangeForm />

        <div className="mt-6">
          <form onSubmit={onSubmitHandler}>
            <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-center sm:border-t sm:border-gray-200 sm:py-5 pt-3">
              <label
                htmlFor="current-password"
                className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
              >
                Current Password
              </label>
              <div className="mt-1 sm:mt-0 sm:col-span-2">
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="max-w-lg block w-full shadow-sm focus:ring-blue-500 border focus:border-blue-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md p-2"
                />
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-center sm:border-t sm:border-gray-200 sm:py-5 mt-2">
              <label
                htmlFor="current-password"
                className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
              >
                New Password
              </label>
              <div className="mt-1 sm:mt-0 sm:col-span-2">
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="max-w-lg block w-full shadow-sm focus:ring-blue-500 border focus:border-blue-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md p-2"
                />
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-center sm:border-t sm:border-gray-200 sm:py-5 mt-2">
              <label
                htmlFor="current-password"
                className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
              >
                Confirm New Password
              </label>
              <div className="mt-1 sm:mt-0 sm:col-span-2">
                <input
                  id="confirmNewPassword"
                  name="confirmNewPassword"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="max-w-lg block w-full shadow-sm focus:ring-blue-500 border focus:border-blue-500 sm:max-w-xs sm:text-sm border-gray-300 rounded-md p-2 items-align"
                />
              </div>
            </div>
            <div className="pt-5 border-t border-grey-200">
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Save
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
