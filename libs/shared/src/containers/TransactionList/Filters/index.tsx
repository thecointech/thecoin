import { DateRangeSelect } from '../../../components/DateRangeSelect';
import React from 'react';

type VisualProps={
    onDateRangeChange: (from: Date, until: Date) => void,
};

export const Filters = (props:VisualProps) => {

    return (
      <>
        <DateRangeSelect onDateRangeChange={props.onDateRangeChange} />
      </>
    );
}
