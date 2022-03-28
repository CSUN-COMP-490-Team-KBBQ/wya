// Landing page layout - header and body
// Body will be replaced with:
// > login
// > password reset

import React from 'react';
import { Popover } from '@headlessui/react';
import logo from '../../assets/wya-logo.png';

const PublicPage: React.FC = ({ children }): JSX.Element => {
  return (
    <div className="relative bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32 h-screen">
          <Popover>
            <div className="relative pt-6 px-4 sm:px-6 lg:px-8">
              <nav
                className="relative flex items-center justify-between sm:h-10 lg:justify-between"
                aria-label="Global"
              >
                <div className="flex items-center flex-grow flex-shrink-0 lg:flex-grow-0">
                  <div className="flex items-center justify-between w-full md:w-auto">
                    <a href="#">
                      {/* <span className="sr-only">Workflow</span> */}
                      <img className="h-8 w-auto sm:h-10" src={logo} />
                    </a>
                  </div>
                </div>
                <a
                  href="#"
                  className="font-large text-blue-600 hover:text-indigo-500 no-underline"
                >
                  Log in
                </a>
              </nav>
            </div>
          </Popover>

          <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default PublicPage;
