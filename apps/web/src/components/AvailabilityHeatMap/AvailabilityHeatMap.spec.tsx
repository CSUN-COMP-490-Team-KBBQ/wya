import React from 'react';
import { render, screen } from '@testing-library/react';

import AvailabilityHeatMap from './AvailabilityHeatMap';
import {
  formatXDaysToSlicedDateString,
  createHeatMapAvailabilityDataArray,
  sortObjectByKeys,
} from '../../lib/availability';
import { EventPlanAvailabilityDocument } from '../../interfaces';

const FAKE_AVAILABILITY: EventPlanAvailabilityDocument = {
  data: {
    '04:15': {
      '1634972400000': [],
      '1635058800000': [],
    },
    '04:45': {
      '1634972400000': [],
      '1635058800000': ['user3'],
    },
    '04:30': {
      '1634972400000': [],
      '1635058800000': ['user3'],
    },
    '04:00': {
      '1634972400000': ['user1'],
      '1635058800000': ['user1', 'user2'],
    },
  },
} as {
  data: {
    [time: string]: { [date: string]: string[] };
  };
};

const FAKE_YTIMES: string[] = sortObjectByKeys<{
  [time: string]: { [date: string]: string[] };
}>(FAKE_AVAILABILITY.data);
const FAKE_XDAYS: string[] = sortObjectByKeys<{ [date: string]: string[] }>(
  FAKE_AVAILABILITY.data['04:00']
);

const FAKE_HEATMAPDATA = {
  yData: FAKE_YTIMES,
  xData: formatXDaysToSlicedDateString(FAKE_XDAYS),
  mapData: createHeatMapAvailabilityDataArray(
    FAKE_YTIMES,
    FAKE_XDAYS,
    FAKE_AVAILABILITY
  ),
};

it('renders component', () => {
  render(
    <AvailabilityHeatMap
      yLabels={FAKE_HEATMAPDATA.yData}
      xLabels={FAKE_HEATMAPDATA.xData}
      data={FAKE_HEATMAPDATA.mapData}
      onClick={() => undefined}
    />
  );
  expect(screen.getByText('Sat Oct 23 2021')).toBeTruthy();
  expect(screen.getByText('Sun Oct 24 2021')).toBeTruthy();

  expect(screen.getByText('04:00')).toBeTruthy();
  expect(screen.getByText('04:15')).toBeTruthy();
  expect(screen.getByText('04:30')).toBeTruthy();
  expect(screen.getByText('04:45')).toBeTruthy();
});
