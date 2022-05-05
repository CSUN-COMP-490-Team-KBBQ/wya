import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  HomeIcon,
  MenuIcon,
  UserGroupIcon,
  XIcon,
  PencilIcon,
  CalendarIcon,
  IdentificationIcon,
} from '@heroicons/react/outline';
import { Link, useLocation } from 'react-router-dom';

import { useUserRecordContext } from '../../contexts/UserRecordContext';
import { logOut } from '../../lib/auth';

import logo from '../../assets/wya-logo.png';

const content = {
  DASHBOARD: '/dashboard',
  PLAN_AN_EVENT: '/plan-event',
  FRIENDS: '/friends',
  SETTINGS: '/settings/general',
  AVAILABILITY: '/availability',
};

const navigation = [
  {
    name: 'Dashboard',
    icon: HomeIcon,
    content: content.DASHBOARD,
    current: true,
  },
  {
    name: 'Plan An Event',
    icon: PencilIcon,
    content: content.PLAN_AN_EVENT,
    current: false,
  },
  {
    name: 'Friends',
    icon: UserGroupIcon,
    content: content.FRIENDS,
    current: false,
  },
  {
    name: 'Availability',
    icon: CalendarIcon,
    content: content.AVAILABILITY,
    current: false,
  },

  {
    name: 'View Profile',
    icon: IdentificationIcon,
    content: content.SETTINGS,
    current: false,
  },
];

// @ts-ignore
function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const Sidebar: React.FC = ({ children }): JSX.Element => {
  const location = useLocation();
  const { userRecord } = useUserRecordContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  navigation.forEach((item) =>
    item.content === location.pathname
      ? (item.current = true)
      : (item.current = false)
  );

  return (
    <div className="h-full flex">
      {/* Sidebar for mobile */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 flex z-40 lg:hidden"
          onClose={setSidebarOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white focus:outline-none">
              <Transition.Child
                as={Fragment}
                enter="ease-in-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="absolute top-0 right-0 -mr-12 pt-2">
                  <button
                    type="button"
                    className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="sr-only">Close sidebar</span>
                    <XIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </button>
                </div>
              </Transition.Child>
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <div className="flex-shrink-0 flex items-center px-4 justify-center">
                  <a href="/dashboard">
                    <img className="h-16 w-auto" src={logo} alt="wya? logo" />
                  </a>
                </div>
                <nav aria-label="Sidebar" className="mt-5">
                  <div className="px-2 space-y-1">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.content}
                        className={classNames(
                          item.current
                            ? 'bg-gray-100 text-gray-900'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                          'group flex items-center px-2 py-2 text-base font-medium rounded-md no-underline w-full'
                        )}
                      >
                        <item.icon
                          className={classNames(
                            item.current
                              ? 'text-gray-500'
                              : 'text-gray-400 group-hover:text-gray-500',
                            'mr-4 h-6 w-6'
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </nav>
              </div>
              <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                <Link
                  to={content.SETTINGS}
                  className="flex-shrink-0 group block no-underline"
                >
                  <div className="flex items-center">
                    <div className="ml-3 text-left">
                      <p className="text-base font-medium text-gray-700 group-hover:text-gray-900 mb-0">
                        {userRecord?.firstName} {userRecord?.lastName}
                      </p>
                      <button
                        className="text-gray-600 hover:text-gray-900 group flex items-center py-2 text-sm font-medium rounded-md no-underline w-full"
                        onClick={logOut}
                      >
                        {' '}
                        Sign Out &nbsp;{' '}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          stroke-width="2"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </Transition.Child>
          <div className="flex-shrink-0 w-14" aria-hidden="true">
            {/* Force sidebar to shrink to fit close icon */}
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          {/* Sidebar component, swap this element with another sidebar if you like */}
          <div className="flex-1 flex flex-col min-h-screen border-r border-gray-200 bg-gray-100">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4 justify-center">
                <a href="/dashboard">
                  <img className="h-16 w-auto" src={logo} alt="wya? logo" />
                </a>
              </div>
              <nav className="mt-5 flex-1" aria-label="Sidebar">
                <div className="px-2 space-y-1">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.content}
                      className={classNames(
                        item.current
                          ? 'bg-gray-200 text-gray-900'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                        'group flex items-center px-2 py-2 text-sm font-medium rounded-md no-underline w-full'
                      )}
                    >
                      <item.icon
                        className={classNames(
                          item.current
                            ? 'text-gray-500'
                            : 'text-gray-400 group-hover:text-gray-500',
                          'mr-3 h-6 w-6'
                        )}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  ))}
                </div>
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <Link
                to={content.SETTINGS}
                className="flex-shrink-0 w-full group block no-underline"
              >
                <div className="flex items-center">
                  <div className="ml-3 text-left">
                    <p className="text-md font-medium text-gray-700 group-hover:text-gray-900 mb-0">
                      {userRecord?.firstName} {userRecord?.lastName}
                    </p>
                    <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700 mb-0">
                      <button
                        className="text-gray-600 hover:text-gray-900 group flex items-center py-2 text-sm font-medium rounded-md no-underline w-full"
                        onClick={logOut}
                      >
                        Sign Out &nbsp;{' '}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          stroke-width="2"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                      </button>
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
        <div className="lg:hidden">
          <div className="flex items-center justify-between bg-gray-50 border-b border-gray-200 px-4 py-1.5">
            <div>
              <a href="/dashboard">
                <img className="h-12 w-auto" src={logo} alt="wya? logo" />
              </a>
            </div>
            <div>
              <button
                type="button"
                className="-mr-3 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900"
                onClick={() => setSidebarOpen(true)}
              >
                <span className="sr-only">Open sidebar</span>
                <MenuIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  );
};

export default Sidebar;
