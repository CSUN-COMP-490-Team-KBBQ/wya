import { useState } from 'react';
import { Switch } from '@headlessui/react';
import { BellIcon, MenuAlt2Icon } from '@heroicons/react/outline';
import { SearchIcon } from '@heroicons/react/solid';
// import { Link } from 'react-router-dom';

import { useUserRecordContext } from '../../contexts/UserRecordContext';

import LandingPage from '../LandingPage/LandingPage';

import PageSpinner from '../../components/PageSpinner/PageSpinner';

const tabs = [
  { name: 'General', href: '#', current: true },
  { name: 'Password', href: '#', current: false },
  { name: 'Notifications', href: '#', current: false },
  { name: 'Plan', href: '#', current: false },
  { name: 'Billing', href: '#', current: false },
  { name: 'Team Members', href: '#', current: false },
];

// @ts-ignore
function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function SettingsPage() {
  const { pending, userRecord } = useUserRecordContext();
  // const [sidebarOpen, setSidebarOpen] = useState(false);
  const [automaticTimezoneEnabled, setAutomaticTimezoneEnabled] =
    useState(true);
  const [autoUpdateApplicantDataEnabled, setAutoUpdateApplicantDataEnabled] =
    useState(false);

  if (pending) {
    return <PageSpinner />;
  }

  if (userRecord) {
    return (
      <div className="flex-1 relative z-0 flex overflow-hidden">
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          {/* Start main area*/}
          <div>
            {/* Content area */}
            <div className="md:pl-64">
              <div className="max-w-4xl mx-auto flex flex-col md:px-8 xl:px-0">
                <div className="sticky top-0 z-10 flex-shrink-0 h-16 bg-white border-b border-gray-200 flex">
                  <button
                    type="button"
                    className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500 md:hidden"
                    // onClick={() => setSidebarOpen(true)}
                  >
                    <span className="sr-only">Open sidebar</span>
                    <MenuAlt2Icon className="h-6 w-6" aria-hidden="true" />
                  </button>
                  <div className="flex-1 flex justify-between px-4 md:px-0">
                    <div className="flex-1 flex">
                      <form
                        className="w-full flex md:ml-0"
                        action="#"
                        method="GET"
                      >
                        <label
                          htmlFor="mobile-search-field"
                          className="sr-only"
                        >
                          Search
                        </label>
                        <label
                          htmlFor="desktop-search-field"
                          className="sr-only"
                        >
                          Search
                        </label>
                        <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center">
                            <SearchIcon
                              className="flex-shrink-0 h-5 w-5"
                              aria-hidden="true"
                            />
                          </div>
                          <input
                            name="mobile-search-field"
                            id="mobile-search-field"
                            className="h-full w-full border-transparent py-2 pl-8 pr-3 text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-transparent focus:placeholder-gray-400 sm:hidden"
                            placeholder="Search"
                            type="search"
                          />
                          <input
                            name="desktop-search-field"
                            id="desktop-search-field"
                            className="hidden h-full w-full border-transparent py-2 pl-8 pr-3 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-0 focus:border-transparent focus:placeholder-gray-400 sm:block"
                            placeholder="Search jobs, applicants, and more"
                            type="search"
                          />
                        </div>
                      </form>
                    </div>
                    <div className="ml-4 flex items-center md:ml-6">
                      <button
                        type="button"
                        className="bg-white rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                      >
                        <BellIcon className="h-6 w-6" aria-hidden="true" />
                        <span className="sr-only">View notifications</span>
                      </button>
                    </div>
                  </div>
                </div>

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
                              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
                              defaultValue={
                                // tabs.find((tab) => tab.current).name
                                'General'
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
                                        ? 'border-purple-500 text-purple-600'
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
                          <div className="mt-10 divide-y divide-gray-200">
                            <div className="space-y-1">
                              <h3 className="text-lg leading-6 font-medium text-gray-900">
                                Profile
                              </h3>
                              <p className="max-w-2xl text-sm text-gray-500">
                                This information will be displayed publicly so
                                be careful what you share.
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
                                        className="bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
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
                                        className="bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
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
                                        className="bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
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
                                        className="bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                                      >
                                        Update
                                      </button>
                                    </span>
                                  </dd>
                                </div>
                                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:border-b sm:border-gray-200">
                                  <dt className="text-sm font-medium text-gray-500">
                                    Job title
                                  </dt>
                                  <dd className="mt-1 flex text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    <span className="flex-grow">
                                      Human Resources Manager
                                    </span>
                                    <span className="ml-4 flex-shrink-0">
                                      <button
                                        type="button"
                                        className="bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                                      >
                                        Update
                                      </button>
                                    </span>
                                  </dd>
                                </div>
                              </dl>
                            </div>
                          </div>

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
                                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                                  <dt className="text-sm font-medium text-gray-500">
                                    Language
                                  </dt>
                                  <dd className="mt-1 flex text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    <span className="flex-grow">English</span>
                                    <span className="ml-4 flex-shrink-0">
                                      <button
                                        type="button"
                                        className="bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                                      >
                                        Update
                                      </button>
                                    </span>
                                  </dd>
                                </div>
                                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:pt-5">
                                  <dt className="text-sm font-medium text-gray-500">
                                    Date format
                                  </dt>
                                  <dd className="mt-1 flex text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    <span className="flex-grow">
                                      DD-MM-YYYY
                                    </span>
                                    <span className="ml-4 flex-shrink-0 flex items-start space-x-4">
                                      <button
                                        type="button"
                                        className="bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
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
                                        className="bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                                      >
                                        Remove
                                      </button>
                                    </span>
                                  </dd>
                                </div>
                                <Switch.Group
                                  as="div"
                                  className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:pt-5"
                                >
                                  <Switch.Label
                                    as="dt"
                                    className="text-sm font-medium text-gray-500"
                                    passive
                                  >
                                    Automatic timezone
                                  </Switch.Label>
                                  <dd className="mt-1 flex text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    <Switch
                                      checked={automaticTimezoneEnabled}
                                      onChange={setAutomaticTimezoneEnabled}
                                      className={classNames(
                                        automaticTimezoneEnabled
                                          ? 'bg-purple-600'
                                          : 'bg-gray-200',
                                        'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-auto'
                                      )}
                                    >
                                      <span
                                        aria-hidden="true"
                                        className={classNames(
                                          automaticTimezoneEnabled
                                            ? 'translate-x-5'
                                            : 'translate-x-0',
                                          'inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
                                        )}
                                      />
                                    </Switch>
                                  </dd>
                                </Switch.Group>
                                <Switch.Group
                                  as="div"
                                  className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:border-b sm:border-gray-200"
                                >
                                  <Switch.Label
                                    as="dt"
                                    className="text-sm font-medium text-gray-500"
                                    passive
                                  >
                                    Auto-update applicant data
                                  </Switch.Label>
                                  <dd className="mt-1 flex text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    <Switch
                                      checked={autoUpdateApplicantDataEnabled}
                                      onChange={
                                        setAutoUpdateApplicantDataEnabled
                                      }
                                      className={classNames(
                                        autoUpdateApplicantDataEnabled
                                          ? 'bg-purple-600'
                                          : 'bg-gray-200',
                                        'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-auto'
                                      )}
                                    >
                                      <span
                                        aria-hidden="true"
                                        className={classNames(
                                          autoUpdateApplicantDataEnabled
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
            </div>
          </div>
          {/* End main area */}
        </main>
      </div>
    );
  }

  return <LandingPage />;
}
