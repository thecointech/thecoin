import React from 'react'
import { CustomGraphLayers } from './CustomGraphLayers'
import range from 'lodash/range'
import { CoinReturns } from '../BenefitsSimulator/simulator'
import { AreaDatum, OnClickHandler } from './types'
export * from './types';

type Props = {
  maxGraphPoints: number,
  data: CoinReturns[];
  onClick: OnClickHandler;
}

const weekScaler = {
  legend: "Weeks",
  scale: 1,
  scaler: (idx: number) => idx
};

const monthScaler = {
  // There is approx 12 * 4.35 weeks periods in a year
  legend: "Months",
  scale: 4.348,
  scaler: (idx: number) => Math.round(idx / 4.348)
};

const yearPreciseScaler = {
  legend: "Years",
  scale: 52.178,
  scaler: (idx: number) => (idx / 52.178).toFixed(1),
};

const yearRoundedScaler = {
  legend: "Years",
  scale: 52.178,
  scaler: (idx: number) => Math.round(idx / 52.178),
}

const getTimeScaler = (numWeeks: number) => {
  // In one year, show weeks
  if (numWeeks <= 53) return weekScaler;
  // in 5 years or less, show months
  if (numWeeks <= 261) return monthScaler;
  // in 12 years or less, show preciseYears
  if (numWeeks <= 261) return yearPreciseScaler;
  // else, show rounded years
  return yearRoundedScaler;
}

const MinimumGraphPoints = 5;
// The number of graph points we use oscillate between
// 5 and 15
const calcNumGraphPoints = (max: number, weeks: number, scale: number) => {
  const maxEntries = Math.floor(weeks / scale);
  if (maxEntries <= max) return Math.floor(maxEntries);
  // Do we have any round divisors?  If so, use 'em
  for (let i = max; i >= MinimumGraphPoints; i--)
    if (maxEntries % i == 0) return i;
  return max;
}

export const AreaGraph = ({maxGraphPoints, data, onClick }: Props) => {

  // If we have no data, we have no graph
  if (data.length < MinimumGraphPoints) return null;

  const {legend, scale, scaler} = getTimeScaler(data.length)

  const datum = data.map((r, idx): AreaDatum => ({
    ...r,
    x: scaler(idx),
    y: r.median,
  }));

  const numGraphPoints = calcNumGraphPoints(maxGraphPoints, datum.length, scale);
  // Naive approach, we skip the extra elements
  const step = (datum.length - 1) / numGraphPoints;
  const filtered = range(0, numGraphPoints + 1).map(idx => datum[Math.round(idx * step)]);
  // Create a series using the filtered datum
  const serie = [{
    data: filtered,
    id: "avg",
  }]

  return <CustomGraphLayers data={serie} xlegend={legend} onClick={onClick} />
}
