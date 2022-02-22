import moment from 'moment';

import { HourlyTimeFormat } from '../interfaces';

export function formatHourlyTimeString(
  hourlyTimeString: string,
  hourlyTimeFormat: HourlyTimeFormat
) {
  return moment(hourlyTimeString, [`h:mm a`, `h:mm A`, `HH:mm`], true).format(
    `${hourlyTimeFormat}:mm`
  );
}
