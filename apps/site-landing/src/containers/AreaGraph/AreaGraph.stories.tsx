import React from 'react';
import { Story } from '@storybook/react';
import { AreaGraph as Component } from '.';
import { CoinReturns } from '../ReturnProfile/data';

const meta = {
  title: 'Landing/Graph/Area',
  component: Component,
  args: {
    numPoints: 12,
    dataToGenerate: 100,
    initial: 100,
    exponentialGrowth: 1.1,
    linearGrowth: 1.5,
    medianFactor: 0.90,
    lowerBound: 0.50,
    upperBound: 1.3,
  },
}
type Props = typeof meta.args;

export const Area: Story<Props> = (props) =>
  <div style={{ width: "600px", height: "400px" }}>
    <Component maxGraphPoints={props.numPoints} data={generateData(props)} />
  </div>

function generateData(args: Props) {
  const data: CoinReturns[] = [];
  for (let i = 0; i < args.dataToGenerate; i++) {
    const val = args.initial + (i * args.linearGrowth) + Math.pow(i, args.exponentialGrowth);
    const low = val * args.lowerBound;
    const high = val * args.upperBound
    data.push({
      week: i,
      mean: val,
      median: val * args.medianFactor,
      lowerBound: Math.min(low, high),
      upperBound: Math.max(low, high),
      values: []
    });
  }
  return data;
}

export default meta;
