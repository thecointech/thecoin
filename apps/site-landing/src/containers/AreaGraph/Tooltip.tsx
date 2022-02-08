import React, { useEffect } from 'react';
import { BasicTooltip } from '@nivo/tooltip';
import { SliceTooltip } from '@nivo/line';
import type { AreaDatum } from './types';
import { GraphHoverReducer } from './reducer';

export const AreaTooltip: SliceTooltip = (props) => {
  const point = props.slice.points[0];
  const data: AreaDatum = point.data as any;
  const actions = GraphHoverReducer.useApi();
  useEffect(() => {
    actions.setHovered(data)
  }, [data])

  return (
    <BasicTooltip
      id="avg: "
      value={`$${data.median.toFixed(2)}`}
      color={point.color}
      enableChip
    />
  );
};
