import React from 'react';
import { Link } from 'react-router-dom';

// Keep this for future reference
// import logo from '../../assets/wya-logo.png';
import image from '../../assets/background14.png';

export default function LandingPage() {
  return (
    <>
      <div className="relative bg-white overflow-auto-">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <div className="relative pt-6 px-4 sm:px-6 lg:px-8">
              <nav
                className="relative flex items-center justify-between"
                aria-label="Global"
              >
                <div className="flex items-center flex-grow flex-shrink-0">
                  <div className="flex items-center justify-between w-full">
                    {/* added for build to pass */}
                    <a href="example.com">
                      {/* Keeping this here for reference */}
                      {/* <img
                        className="h-8 w-auto sm:h-10"
                        src={logo}
                        alt="wya? logo"
                      /> */}
                    </a>
                  </div>
                  {/* Keeping this here for reference */}
                  {/* <Link
                    to="/login"
                    className="flex justify-end font-large w-full z-10 text-blue-600 hover:text-blue-500 no-underline"
                  >
                    Log in
                  </Link> */}
                </div>
              </nav>
            </div>

            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Scheduling</span>{' '}
                  <span className="block text-blue-600 xl:inline">
                    Simplified
                  </span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  wya? is a web-based application that will help you, your
                  friends, or your family meet up without the headache of
                  planning. We are creating a system to easily make plans by
                  stacking personal schedules so that your group will be able to
                  clearly see who&apos;s doing what and when. The add-a-friend
                  feature and overall simplicity of wya? removes the need for
                  multiple apps and lets you add friends, plan, and invite
                  whomever you&apos;d like!
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="inline-flex rounded-md shadow">
                    <Link
                      to="/register"
                      className="no-underline flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                    >
                      Get started
                    </Link>
                    <Link
                      to="/login"
                      className="no-underline flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                    >
                      Log In
                    </Link>
                  </div>
                </div>
              </div>
              <svg
                className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-white transform translate-x-1/2"
                fill="currentColor"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <polygon points="50,0 100,0 50,100 0,100" />
              </svg>
            </main>
          </div>
        </div>
      </div>

      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <img
          className="h-full w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
          src={image}
          alt="hand holding phone"
        />
      </div>
    </>
  );
}
