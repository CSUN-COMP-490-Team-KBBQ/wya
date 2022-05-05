import React from 'react';
import { LockClosedIcon, XCircleIcon } from '@heroicons/react/solid';

import { useHistory, Link } from 'react-router-dom';
import { logIn } from '../../lib/auth';
import { useUserContext } from '../../contexts/UserContext';

import logo from '../../assets/wya-logo.png';

export default function LoginForm(): JSX.Element {
  const history = useHistory();
  const { user } = useUserContext();
  const [displayError, setDisplayError] = React.useState<string>('');
  React.useEffect(() => {
    if (user) {
      history.push('/dashboard');
    }
  }, [user, history]);

  const logInHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const formValue = Object.fromEntries(formData.entries());
    // eslint-disable-next-line
    console.log('USER_LOGIN', formValue);
    const { email, password } = formValue;
    logIn(email as string, password as string)
      .then(({ uid }) => {
        // eslint-disable-next-line
        console.log(`Logged in as user ${uid}`); // tag as debug
        history.push('/dashboard');
      })
      // eslint-disable-next-line
      .catch(console.error);
      const errorResponse = `Please try again!`;
      setDisplayError(errorResponse);
  };

  return (
    <div className="max-w-md w-full space-y-8">
      <div>
        <img className="mx-auto h-12 w-auto" src={logo} alt="wya? logo" />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
      </div>

       {/* Negative Alert Banner */}
       {displayError.length > 0 && (
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
                  Error: Email address or password is incorrect.
                </h3>
                <div className="mt-2 text-sm text-red-700">{displayError}</div>
              </div>
            </div>
          </div>
        )}

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-4 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="mt-4 space-y-6" onSubmit={logInHandler}>
            <input type="hidden" name="remember" defaultValue="true" />
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/password-reset"
                  className="font-medium text-indigo-600 hover:text-indigo-500 no-underline"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <LockClosedIcon
                    className="h-5 w-5 text-blue-500 group-hover:text-blue-400"
                    aria-hidden="true"
                  />
                </span>
                Sign in
              </button>
            </div>

            <div className="flex justify-center">
              <div className="text-sm">
                <Link
                  to="/register"
                  className="font-medium text-indigo-600 hover:text-indigo-500 no-underline"
                >
                  Don't have an account?
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
