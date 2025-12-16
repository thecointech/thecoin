import React from 'react';
import { BasicTooltip } from '@nivo/tooltip';
import type { PointTooltipProps } from '@nivo/line';
import type { AreaSeries } from './types';

export const Tooltip = (props: PointTooltipProps<AreaSeries>) => {
  const {point} = props;
  const data = point.data;
  return (
    <BasicTooltip
      id="avg"
      value={`$${data.median?.toFixed(2)}`}
      color={point.color}
      enableChip
    />
  );
};
