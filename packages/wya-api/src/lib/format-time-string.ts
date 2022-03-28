import moment from 'moment';

import { TimeFormat } from '../interfaces';

const SUPPORTED_TIME_FORMATS = [
  'h:mm a',
  'h:mm A',
  'hh:mm a',
  'hh:mm A',
  'HH:mm',
];

export function formatTimeString(
  timeString: string,
  intendedTimeFormat: TimeFormat
) {
  return moment(timeString, SUPPORTED_TIME_FORMATS, true).format(
    intendedTimeFormat
  );
}
