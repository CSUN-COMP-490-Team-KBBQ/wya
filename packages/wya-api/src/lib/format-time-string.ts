import moment from 'moment';

// import { TimeFormat } from '../lib/time-format';

/** RO3: copied in CreateEventPlanForm and in availability.ts*/
const SUPPORTED_TIME_FORMATS = [
  'h:mm a',
  'h:mm A',
  'hh:mm a',
  'hh:mm A',
  'HH:mm',
];
/** End of RO3 */

/** RO3: copied from wya-api/lib/time-format */
enum TimeFormat {
  TWELVE_HOURS = 'hh:mm a',
  TWENTY_FOUR_HOURS = 'HH:mm',
}
/** End of RO3 */

export function formatTimeString(
  timeString: string,
  intendedTimeFormat: TimeFormat
) {
  return moment(timeString, SUPPORTED_TIME_FORMATS, true).format(
    intendedTimeFormat
  );
}
