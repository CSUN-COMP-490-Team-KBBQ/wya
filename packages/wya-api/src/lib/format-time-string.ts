import moment from 'moment';

import { SUPPORTED_TIME_FORMATS, TimeFormat } from '../interfaces';

export function formatTimeString(
  timeString: string,
  intendedTimeFormat: TimeFormat
) {
  return moment(timeString, SUPPORTED_TIME_FORMATS, true).format(
    intendedTimeFormat
  );
}
