import React from 'react';
import { BasicTooltip } from '@nivo/tooltip';
import { SliceTooltip } from '@nivo/line';
import type { AreaDatum, OnHoverCallback } from './types';


export const getTooltip = (cb?: OnHoverCallback) => {

  const AreaTooltip: SliceTooltip = (props) => {
    const point = props.slice.points[0];
    const data: AreaDatum = point.data as any;
    cb?.(data);

    return (
      <BasicTooltip
        id="avg: "
        value={`$${data.mean.toFixed(2)}`}
        color={point.color}
        enableChip
      />
    );
  };
  return AreaTooltip;
}
