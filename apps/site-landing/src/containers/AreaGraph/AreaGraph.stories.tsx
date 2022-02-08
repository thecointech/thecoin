import React, { useEffect } from 'react';
import { Story } from '@storybook/react';
import { AreaGraph as Component, GraphHoverReducer } from '.';
import { CoinReturns } from '../ReturnProfile/data';
import { withReducer, withStore } from '@thecointech/storybookutils';
import { action } from '@storybook/addon-actions';

const meta = {
  title: 'Landing/Benefits/Area',
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
  decorators: [
    withReducer(GraphHoverReducer),
    withStore(),
  ]
}
type Props = typeof meta.args;
const onClick = action("on-click");
export const Area: Story<Props> = (props) => {
  const clicked = GraphHoverReducer.useData();
  useEffect(() => {
    onClick(clicked)
  }, [clicked]);

  return (
    <div style={{ width: "600px", height: "400px" }}>
      <Component maxGraphPoints={props.numPoints} data={generateData(props)} />
    </div>
  )
}

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
