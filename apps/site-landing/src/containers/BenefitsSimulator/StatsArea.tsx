import React from 'react';
import { first, last } from '@thecointech/utilities';
import { GraphHoverReducer } from '../AreaGraph';
import { MarketData, netFiat } from '../ReturnProfile/data';
import { DateTime } from 'luxon';

type HoverAreaProps = {
  market?: MarketData[],
}
export const StatsArea = (_props: HoverAreaProps) => {

  GraphHoverReducer.useStore();
  const {hovered} = GraphHoverReducer.useData();
  if (!hovered) return null;
  const worst = first(hovered.values)
  const best = last(hovered.values)
  return (
    <div>
      <div>Average: ${hovered.median.toFixed(2)}</div>
      <div>Best: ${netFiat(best).toFixed(2)}</div>
      <ShowPeriod date={best.date} weeks={hovered.week} />
      <div>Worst: ${netFiat(worst).toFixed(2)}</div>
      <ShowPeriod date={worst.date} weeks={hovered.week} />
    </div>
  )
}

const ShowPeriod = ({date, weeks}: {date: DateTime, weeks: number}) =>
  <div>Period: {date.minus({weeks}).toSQLDate()} =&gt; {date.toSQLDate()}</div>
