import React from 'react';
import { BasicTooltip } from '@nivo/tooltip';
import { PointTooltip } from '@nivo/line';

export const AreaGraphTooltip: PointTooltip = (props) => {
  // const dayStr = dayjs(props.data.month).format('ll');
  return (
      <BasicTooltip
          id={props.point.id}
          value={"Shixxle"}
          // color={props.color}
          enableChip
      />
  );
};
