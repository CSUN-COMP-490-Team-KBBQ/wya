import React from 'react';
import './AvailabilityHeatMap.css';
import HeatMap from 'react-heatmap-grid';

type AvailabilityHeatMapProps = {
  yLabels: string[];
  xLabels: string[];
  data: number[][];
  onClick: (x: number, y: number) => void;
};

function AvailabilityHeatMap(props: AvailabilityHeatMapProps): JSX.Element {
  const { yLabels, xLabels, data, onClick } = props;

  const getOpacity = (value: number, min: number, max: number) => {
    if (max - min !== 0) {
      return 1 - (max - value) / (max - min);
    }
    if (max === min && max !== 0) {
      return 1;
    }
    return 0;
  };

  return (
    <div>
      <div
        style={{
          fontSize: '13px',
          width: 'auto',
          // temp set width for mock data
          maxWidth: '1024px',
        }}
      >
        <HeatMap
          xLabels={xLabels}
          yLabels={yLabels}
          xLabelsLocation="top"
          xLabelWidth={60}
          yLabelWidth={60}
          data={data}
          squares={false}
          height={30}
          onClick={(x: number, y: number) => onClick(x, y)}
          cellStyle={(
            // eslint-disable-next-line
            _background: any,
            value: number,
            min: number,
            max: number
          ) => ({
            background: `rgb(0, 151, 230, ${getOpacity(value, min, max)})`,
            fontSize: '11.5px',
            color: '#444',
            border: '2px solid gray',
          })}
        />
      </div>
    </div>
  );
}

export default AvailabilityHeatMap;
