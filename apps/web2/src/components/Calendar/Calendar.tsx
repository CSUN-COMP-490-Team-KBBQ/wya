import { FunctionComponent, useEffect, useState } from 'react';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/solid';

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const Calendar: FunctionComponent = () => {
  const date = new Date();
  const [month, setMonth] = useState<number>(date.getMonth());
  const [year, setYear] = useState<number>(date.getFullYear());
  const [numOfDays, setNumOfDays] = useState<number[]>([]);
  const [emptyDays, setEmptyDays] = useState<number[]>([]);

  const isToday = (date: number) => {
    const today = new Date();
    const d = new Date(year, month, date);

    return today.toDateString() === d.toDateString();
  };

  const nextMonth = () => {
    if (month === 11) {
      setYear(year + 1);
      setMonth(0);
    } else {
      setMonth(month + 1);
    }
  };

  const prevMonth = () => {
    if (month === 0) {
      setYear(year - 1);
      setMonth(11);
    } else {
      setMonth(month - 1);
    }
  };

  useEffect(() => {
    let i;
    let daysInMonth = new Date(year, month + 1, 0).getDate();

    // find where to start calendar day of week
    let dayOfWeek = new Date(year, month).getDay();
    let emptyDaysArray = [];
    for (i = 1; i <= dayOfWeek; i++) {
      emptyDaysArray.push(i);
    }

    let daysArray = [];
    for (i = 1; i <= daysInMonth; i++) {
      daysArray.push(i);
    }

    setEmptyDays(emptyDaysArray);
    setNumOfDays(daysArray);
  }, [year, month]);

  return (
    <>
      <div className="container mx-auto py-4 px-6">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="flex items-center justify-between px-6 py-2 border-b">
            <div>
              <span className="text-lg font-bold text-gray-800">
                {monthNames[month]}
              </span>
              <span className="ml-1 text-lg text-gray-600 font-normal">
                {year}
              </span>
            </div>
            <div className="border rounded-lg px-1 border-b">
              {/* Previous Month Button */}
              <button type="button" onClick={() => prevMonth()}>
                <ArrowLeftIcon className="h-4 w-4 text-gray-500 inline-flex leading-none" />
              </button>
              <div className="border-r inline-flex h-6" />
              {/* Next Month Button */}
              <button type="button" onClick={() => nextMonth()}>
                <ArrowRightIcon className="h-4 w-4 text-gray-500 inline-flex leading-none" />
              </button>
            </div>
          </div>
          <div className="-mx-1 -mb-1">
            <div
              className="flex flex-wrap -mb-8"
              style={{ marginBottom: '-30px' }}
            >
              {days.map((day) => (
                <div key={day} className="px-2 pt-1 pb-8 w-[14.28%]">
                  <div className="text-gray-600 text-sm uppercase tracking-wide font-bold text-center">
                    {day}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap">
              {emptyDays.map((emptyDay) => (
                <div
                  key={emptyDay}
                  className="text-center border-r border-b px-4 pt-2 h-12 w-[14.28%]"
                />
              ))}
              {numOfDays.map((date, index) => (
                <div
                  key={index}
                  className="px-4 pt-2 border-r border-b relative h-12 w-[14.28%]"
                >
                  <div
                    className={classNames(
                      isToday(date)
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-700 hover:bg-blue-200',
                      'inline-flex w-6 h-6 items-center justify-center cursor-pointer text-center leading-none rounded-full transition ease-in-out duration-100'
                    )}
                  >
                    {date}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Calendar;
