import React from 'react';
import { render } from '@testing-library/react';

import AvailabilityHeatMap from './AvailabilityHeatMap';
import {
    formatXDays,
    createAvailabilityDataArray,
    createZeroStateArray,
    sortObjectByKeys,
} from '../../lib/availability';

const FAKE_AVAILABILITY = {
    '04:15': {
        '1635058800000': [],
        '1634972400000': [],
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
};

const FAKE_YTIMES = sortObjectByKeys(FAKE_AVAILABILITY);
const FAKE_XDAYS = sortObjectByKeys(FAKE_AVAILABILITY['04:00']);

const FAKE_HEATMAPDATA = {
    yData: FAKE_YTIMES,
    xData: formatXDays(FAKE_XDAYS),
    mapData: createAvailabilityDataArray(
        FAKE_YTIMES,
        FAKE_XDAYS,
        FAKE_AVAILABILITY
    ),
    zeroState: createZeroStateArray(FAKE_YTIMES.length, FAKE_XDAYS.length),
};

it('renders component', () => {
    const { queryByText } = render(
        <AvailabilityHeatMap
            yLabels={FAKE_HEATMAPDATA.yData}
            xLabels={FAKE_HEATMAPDATA.xData}
            data={FAKE_HEATMAPDATA.mapData}
            onClick={() => undefined}
        />
    );
    expect(queryByText('Sat Oct 23 2021')).toBeTruthy();
    expect(queryByText('Sun Oct 24 2021')).toBeTruthy();

    expect(queryByText('04:00')).toBeTruthy();
    expect(queryByText('04:15')).toBeTruthy();
    expect(queryByText('04:30')).toBeTruthy();
    expect(queryByText('04:45')).toBeTruthy();
});
