import React from 'react';
import { XCircleIcon, CheckCircleIcon } from '@heroicons/react/solid';

import { useUserContext } from '../../contexts/UserContext';
import { changePassword, logIn } from '../../modules/firebase/auth';

const DEFAULT_DISPLAY_MESSAGE_TIMEOUT_IN_SECONDS = 5;

export default function PasswordSettings() {
  const { user } = useUserContext();

  const [displayErrorMessage, setDisplayErrorMessage] = React.useState('');
  const [displayMessage, setDisplayMessage] = React.useState('');

  const displayMessageTimer = React.useRef<any>(null);

  const setDisplayMessageWithTimeout = (message: string) => {
    if (displayMessageTimer.current) {
      clearTimeout(displayMessageTimer.current);
    }

    setDisplayMessage(message);

    displayMessageTimer.current = setTimeout(() => {
      setDisplayMessage('');
    }, DEFAULT_DISPLAY_MESSAGE_TIMEOUT_IN_SECONDS * 1000);
  };

  // TODO: clear input fields on successful submission
  const onSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user) {
      return;
    }

    // Reset display messages on submission
    setDisplayErrorMessage('');
    setDisplayMessage('');

    const formData = new FormData(e.target as HTMLFormElement);
    const formValue = Object.fromEntries(formData.entries());
    const { currentPassword, newPassword, confirmNewPassword } = formValue;

    // HACK: Check if currentPassword is correct by trying to logIn
    try {
      await logIn(user.email as string, currentPassword as string);
    } catch (err: any) {
      if (err.statusCode === 422) {
        return setDisplayErrorMessage(err.message);
      }

      setDisplayErrorMessage(`Error: ${err.message}`);
    }
    // End of HACK

    if (newPassword === currentPassword) {
      return setDisplayErrorMessage(
        'New password must be different from the current password!'
      );
    }

    if (newPassword !== confirmNewPassword) {
      return setDisplayErrorMessage('New password confirmation failed!');
    }

    try {
      await changePassword(newPassword as string);

      setDisplayMessageWithTimeout('Password successfully updated!');
    } catch (err: any) {
      if (err.statusCode === 422) {
        setDisplayErrorMessage(err.message);
        return;
      }

      setDisplayErrorMessage(`Error: ${err.message}`);
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

        {/* Negative Alert Banner */}
        {displayErrorMessage && (
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
                <div className="mt-2 text-sm text-red-700">
                  {displayErrorMessage}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Positive Alert Banner */}
        {displayMessage && (
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
                  {displayMessage}
                </h3>
              </div>
            </div>
          </div>
        )}

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
