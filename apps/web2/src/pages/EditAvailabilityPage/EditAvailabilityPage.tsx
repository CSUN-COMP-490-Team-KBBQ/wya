import React from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Container from 'react-bootstrap/Container';
import Page from '../../components/Page/Page';
import './EditAvailabilityPage.css';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, DotsHorizontalIcon, LocationMarkerIcon,} from '@heroicons/react/solid';


const days = [
    { date: '2021-12-27' },
    { date: '2021-12-28' },
    { date: '2021-12-29' },
    { date: '2021-12-30' },
    { date: '2021-12-31' },
    { date: '2022-01-01', isCurrentMonth: true },
    { date: '2022-01-02', isCurrentMonth: true },
    { date: '2022-01-03', isCurrentMonth: true },
    { date: '2022-01-04', isCurrentMonth: true },
    { date: '2022-01-05', isCurrentMonth: true },
    { date: '2022-01-06', isCurrentMonth: true },
    { date: '2022-01-07', isCurrentMonth: true },
    { date: '2022-01-08', isCurrentMonth: true },
    { date: '2022-01-09', isCurrentMonth: true },
    { date: '2022-01-10', isCurrentMonth: true },
    { date: '2022-01-11', isCurrentMonth: true },
    { date: '2022-01-12', isCurrentMonth: true, isToday: true },
    { date: '2022-01-13', isCurrentMonth: true },
    { date: '2022-01-14', isCurrentMonth: true },
    { date: '2022-01-15', isCurrentMonth: true },
    { date: '2022-01-16', isCurrentMonth: true },
    { date: '2022-01-17', isCurrentMonth: true },
    { date: '2022-01-18', isCurrentMonth: true },
    { date: '2022-01-19', isCurrentMonth: true },
    { date: '2022-01-20', isCurrentMonth: true },
    { date: '2022-01-21', isCurrentMonth: true },
    { date: '2022-01-22', isCurrentMonth: true, isSelected: true },
    { date: '2022-01-23', isCurrentMonth: true },
    { date: '2022-01-24', isCurrentMonth: true },
    { date: '2022-01-25', isCurrentMonth: true },
    { date: '2022-01-26', isCurrentMonth: true },
    { date: '2022-01-27', isCurrentMonth: true },
    { date: '2022-01-28', isCurrentMonth: true },
    { date: '2022-01-29', isCurrentMonth: true },
    { date: '2022-01-30', isCurrentMonth: true },
    { date: '2022-01-31', isCurrentMonth: true },
    { date: '2022-02-01' },
    { date: '2022-02-02' },
    { date: '2022-02-03' },
    { date: '2022-02-04' },
    { date: '2022-02-05' },
    { date: '2022-02-06' },
  ];

  function classNames(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
  }
export default function EditAvailabilityPage(): JSX.Element {
    return (
      <Sidebar>
        <Container fluid>
          {/* 3 column wrapper */}
          <div className="flex-grow w-full max-w-full mx-auto xl:px-8 lg:flex bg-white">
            {/* main wrapper */}
            <div className="flex-1 min-w-0 bg-white lg:flex">
              <div className="bg-white lg:min-w-0 lg:flex-1">
                <div className="h-full py-6 px-4 sm:px-6 lg:px-8 bg-white">
                  {/* Start main area*/}
                  <div
                    className="relative h-full"
                    style={{ minHeight: '36rem' }}
                  >
                    <div className="absolute inset-0 border-2 border-gray-200 border-dashed rounded-lg overflow-y-auto bg-white w-96">
                      <h1 className="pt-4 flex justify-center">Calendar</h1>
                      {/* Calendar */}
                      <div className="flex justify-center px-8">
                        <div className="mt-10 w-96 text-center">
                          <div className="flex items-center text-gray-900">
                            <button
                              type="button"
                              className="-m-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
                            >
                              <span className="sr-only">Previous month</span>
                              <ChevronLeftIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                            </button>
                            <div className="flex-auto font-semibold">
                              January
                            </div>
                            <button
                              type="button"
                              className="-m-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
                            >
                              <span className="sr-only">Next month</span>
                              <ChevronRightIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                            </button>
                          </div>
                          <div className="mt-6 grid grid-cols-7 text-xs leading-6 text-gray-500">
                            <div>M</div>
                            <div>T</div>
                            <div>W</div>
                            <div>T</div>
                            <div>F</div>
                            <div>S</div>
                            <div>S</div>
                          </div>
                          <div className="isolate mt-2 grid grid-cols-7 gap-px rounded-lg bg-gray-200 text-sm shadow ring-1 ring-gray-200">
                            {days.map((day, dayIdx) => (
                              <button
                                key={day.date}
                                type="button"
                                className={classNames(
                                  'py-1.5 hover:bg-gray-100 focus:z-10',
                                  day.isCurrentMonth
                                    ? 'bg-white'
                                    : 'bg-gray-50',
                                  (day.isSelected || day.isToday) &&
                                    'font-semibold',
                                  day.isSelected && 'text-white',
                                  !day.isSelected &&
                                    day.isCurrentMonth &&
                                    !day.isToday &&
                                    'text-gray-900',
                                  !day.isSelected &&
                                    !day.isCurrentMonth &&
                                    !day.isToday &&
                                    'text-gray-400',
                                  day.isToday &&
                                    !day.isSelected &&
                                    'text-indigo-600',
                                  dayIdx === 0 && 'rounded-tl-lg',
                                  dayIdx === 6 && 'rounded-tr-lg',
                                  dayIdx === days.length - 7 && 'rounded-bl-lg',
                                  dayIdx === days.length - 1 && 'rounded-br-lg'
                                )}
                              >
                                <time
                                  dateTime={day.date}
                                  className={classNames(
                                    'mx-auto flex h-7 w-7 items-center justify-center rounded-full',
                                    day.isSelected &&
                                      day.isToday &&
                                      'bg-indigo-600',
                                    day.isSelected &&
                                      !day.isToday &&
                                      'bg-gray-900'
                                  )}
                                >
                                  {day.date.split('-').pop()!.replace(/^0/, '')}
                                </time>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      {/* Calendar End */}
                      {/* Main Area Divider */}
                      <div className="relative py-4">
                        <div
                          className="absolute inset-0 flex items-center"
                          aria-hidden="true"
                        >
                          <div className="w-full" />
                        </div>
                        <div className="relative flex justify-center">
                          <span>
                          <button type="button" className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Edit Availability</button>
                          </span>

                        </div>
                      </div>
                      {/* End Main Area Divider */}
                    </div>
                  </div>
                  {/* End main area */}
                </div>
              </div>
            </div>

              <div className="h-full pl-6 py-6 lg:w-90 bg-white" >
                {/* Start right column area */}
                <div className="h-full relative" style={{ minHeight: '16rem' }}>
                  <div className="justify-center absolute inset-0 border-2 border-gray-200 border-dashed rounded-lg overflow-y-auto bg-white">
                  <h1 className="pt-4 flex justify-center">Your Availability</h1>
                      {/* This is where the finalized heat map will go for user's availability */}
                  </div>
                </div>
                {/* End right column area */}
              </div>
          </div>
        </Container>
      </Sidebar>
    );
  }