import React from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/solid';

import { sendPasswordResetEmail } from '../../modules/firebase/auth';

import logo from '../../assets/wya-logo.png';
import { Link } from 'react-router-dom';

const DEFAULT_DISPLAY_MESSAGE_TIMEOUT_IN_SECONDS = 5;

export default function PasswordResetPage(): JSX.Element {
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

  const onSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Reset display messages on submission
    setDisplayErrorMessage('');
    setDisplayMessage('');

    const formData = new FormData(e.target as HTMLFormElement);
    const formValue = Object.fromEntries(formData.entries());
    const { email } = formValue;

    try {
      await sendPasswordResetEmail(email as string);

      setDisplayMessageWithTimeout(
        `Please check your email and follow the link provided`
      );
    } catch (err: any) {
      if (err.statusCode === 422) {
        setDisplayErrorMessage(err.message);
        return;
      }

      setDisplayErrorMessage(`Error: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:py-28 2xl:py-32">
        {/* Header */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <img className="mx-auto h-12 w-auto" src={logo} alt="wya? logo" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Password Reset
          </h2>
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
                  Password Reset Link: Sent!
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  {displayMessage}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={onSubmitHandler}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Enter the email address you signed up with to get a reset
                  password link.
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="joe@example.com"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Continue
                </button>
                <div className="text-sm pt-4 text-center">
                  <Link
                    to="/login"
                    className="font-medium text-indigo-600 hover:text-indigo-500 no-underline"
                  >
                    Return to Log-In Page
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
