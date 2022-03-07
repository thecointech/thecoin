import React from 'react';
import { BasicTooltip } from '@nivo/tooltip';
import { PointTooltip } from '@nivo/line';
import type { AreaDatum } from './types';

export const Tooltip: PointTooltip = (props) => {
  const {point} = props;
  const data: AreaDatum = point.data as any;
  return (
    <BasicTooltip
      id="avg"
      value={`$${data.median.toFixed(2)}`}
      color={point.color}
      enableChip
    />
  );
};
