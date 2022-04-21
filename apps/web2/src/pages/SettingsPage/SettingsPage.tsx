import React from 'react';
import { Link, useLocation, useHistory } from 'react-router-dom';

import { useUserRecordContext } from '../../contexts/UserRecordContext';

import LandingPage from '../LandingPage/LandingPage';
import GeneralSettings from './GeneralSettings';
import PasswordSettings from './PasswordSettings';

import Sidebar from '../../components/Sidebar/Sidebar';
import PageSpinner from '../../components/PageSpinner/PageSpinner';

const link = {
  GENERAL: '/settings/general',
  PASSWORD: '/settings/password',
};

const tabs = [
  { name: 'General', link: link.GENERAL, current: true },
  { name: 'Password', link: link.PASSWORD, current: false },
];

// @ts-ignore
function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function SettingsPage() {
  const location = useLocation();
  const history = useHistory();
  const { pending, userRecord } = useUserRecordContext();

  tabs.map((tab) =>
    tab.link === location.pathname
      ? (tab.current = true)
      : (tab.current = false)
  );

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
                            // TODO: fix mobile tab selection mismatch with content on refresh
                            defaultValue={
                              // @ts-ignore
                              tabs.find((tab) => tab.current).name
                            }
                            onChange={(e) => {
                              history.push(e.target.value);
                            }}
                          >
                            {tabs.map((tab) => (
                              <option key={tab.name} value={tab.link}>
                                {tab.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="hidden lg:block">
                          <div className="border-b border-gray-200">
                            <nav className="-mb-px flex space-x-8">
                              {tabs.map((tab) => (
                                <Link
                                  key={tab.name}
                                  to={tab.link}
                                  className={classNames(
                                    tab.current
                                      ? 'border-blue-500 text-blue-600'
                                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                                    'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm no-underline'
                                  )}
                                >
                                  {tab.name}
                                </Link>
                              ))}
                            </nav>
                          </div>
                        </div>

                        {/* content */}
                        {location.pathname === link.PASSWORD ? (
                          <PasswordSettings />
                        ) : (
                          // default render
                          <GeneralSettings />
                        )}
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
