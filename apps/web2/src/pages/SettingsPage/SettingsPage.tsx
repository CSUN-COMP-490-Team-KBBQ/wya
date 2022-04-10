import { useState } from 'react';
import { Switch } from '@headlessui/react';
// import { Link } from 'react-router-dom';

import { useUserRecordContext } from '../../contexts/UserRecordContext';

import LandingPage from '../LandingPage/LandingPage';

import Sidebar from '../../components/Sidebar/Sidebar';
import PageSpinner from '../../components/PageSpinner/PageSpinner';

const tabs = [
  { name: 'General', href: '#', current: true },
  { name: 'Password', href: '#', current: false },
];

// @ts-ignore
function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function SettingsPage() {
  const { pending, userRecord } = useUserRecordContext();
  const [standardTimeFormatEnabled, setStandardTimeFormatEnabled] =
    useState(true);

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
                      <h1 className="text-3xl font-extrabold text-gray-900">
                        Settings
                      </h1>
                    </div>
                    <div className="px-4 sm:px-6 md:px-0">
                      <div className="py-6">
                        {/* Tabs */}
                        <div className="lg:hidden">
                          <label htmlFor="selected-tab" className="sr-only">
                            Select a tab
                          </label>
                          <select
                            id="selected-tab"
                            name="selected-tab"
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            defaultValue={
                              // @ts-ignore
                              tabs.find((tab) => tab.current).name
                            }
                          >
                            {tabs.map((tab) => (
                              <option key={tab.name}>{tab.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="hidden lg:block">
                          <div className="border-b border-gray-200">
                            <nav className="-mb-px flex space-x-8">
                              {tabs.map((tab) => (
                                <a
                                  key={tab.name}
                                  href={tab.href}
                                  className={classNames(
                                    tab.current
                                      ? 'border-blue-500 text-blue-600'
                                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                                    'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
                                  )}
                                >
                                  {tab.name}
                                </a>
                              ))}
                            </nav>
                          </div>
                        </div>

                        {/* Description list with inline editing */}
                        {/* Profile */}
                        <div className="mt-10 divide-y divide-gray-200">
                          <div className="space-y-1">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                              Profile
                            </h3>
                            <p className="max-w-2xl text-sm text-gray-500">
                              This information will be displayed publicly so be
                              careful what you share.
                            </p>
                          </div>
                          <div className="mt-6">
                            <dl className="divide-y divide-gray-200">
                              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                                <dt className="text-sm font-medium text-gray-500">
                                  Name
                                </dt>
                                <dd className="mt-1 flex text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                  <span className="flex-grow">
                                    Chelsea Hagon
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
                              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:pt-5">
                                <dt className="text-sm font-medium text-gray-500">
                                  Photo
                                </dt>
                                <dd className="mt-1 flex text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                  <span className="flex-grow">
                                    <img
                                      className="h-8 w-8 rounded-full"
                                      src="https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                      alt=""
                                    />
                                  </span>
                                  <span className="ml-4 flex-shrink-0 flex items-start space-x-4">
                                    <button
                                      type="button"
                                      className="bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                      Update
                                    </button>
                                    <span
                                      className="text-gray-300"
                                      aria-hidden="true"
                                    >
                                      |
                                    </span>
                                    <button
                                      type="button"
                                      className="bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                      Remove
                                    </button>
                                  </span>
                                </dd>
                              </div>
                              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:pt-5">
                                <dt className="text-sm font-medium text-gray-500">
                                  Email
                                </dt>
                                <dd className="mt-1 flex text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                  <span className="flex-grow">
                                    chelsea.hagon@example.com
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
                              Manage how information is displayed on your
                              account.
                            </p>
                          </div>
                          <div className="mt-6">
                            <dl className="divide-y divide-gray-200">
                              <Switch.Group
                                as="div"
                                className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:pt-5"
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
                                    onChange={setStandardTimeFormatEnabled}
                                    className={classNames(
                                      standardTimeFormatEnabled
                                        ? 'bg-blue-600'
                                        : 'bg-gray-200',
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
                      </div>
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
