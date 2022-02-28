import moment from 'moment';

import { TimeFormat } from '../lib/time-format';

/** RO3: copied in CreateEventPlanForm */
const SUPPORTED_TIME_FORMATS = [
  'h:mm a',
  'h:mm A',
  'hh:mm a',
  'hh:mm A',
  'HH:mm',
];
/** End of RO3 */

export function formatTimeString(
  timeString: string,
  intendedTimeFormat: TimeFormat
) {
  return moment(timeString, SUPPORTED_TIME_FORMATS, true).format(
    intendedTimeFormat
  );
}
