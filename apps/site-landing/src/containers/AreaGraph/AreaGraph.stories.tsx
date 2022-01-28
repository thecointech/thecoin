import React from 'react';
import { Story } from '@storybook/react';
import { AreaGraph as Component } from '.';

const meta = {
  title: 'Landing/Graph/Area',
  component: Component,
  args: {
    numPoints: 12,
    initial: 100,
    dataCount: 100,
    exponentialGrowth: 1.1,
    linearGrowth: 1.5,
    medianFactor: 0.90,
    lowerBound: 0.50,
    upperBound: 1.3,
  },
}
type Props = typeof meta.args;
export const Area: Story<Props> = (props) => <Component maxGraphPoints={props.numPoints} data={generateData(props)} />

function generateData(args: Props) {
  const data = [];
  let last = args.initial;
  for (let i = 0; i < args.dataCount; i++) {
    data.push({
      mean: last,
      median: last * args.medianFactor,
      lowerBound: last * args.lowerBound,
      upperBound: last * args.upperBound,
      values: [last]
    });
    last = last * args.linearGrowth + Math.pow(last, args.exponentialGrowth)
  }
  return data;
}

export default meta;
