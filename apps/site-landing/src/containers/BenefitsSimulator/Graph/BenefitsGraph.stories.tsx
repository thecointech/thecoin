import React, { useEffect, useState } from 'react';
import { Meta, Story } from '@storybook/react';
import { BenefitsGraph as Component } from '.';
import { createParams, MarketData } from '../../ReturnProfile/data';
import { range } from 'lodash';
import { DateTime } from 'luxon';

const meta: Meta = {
  title: 'Landing/Benefits/Graph',
  component: Component,
  args: {
    loadingDelay: 2, // simulated delay of loading data.
    growthPercent: 9,
    yearsToSimulate: 60,
    noise: 0.1,
  }
}
export default meta;
type Props = typeof meta.args;

const params = createParams({initialBalance: 1000});
export const Graph: Story<Props> = (props) => {
  const [data, setData] = useState<MarketData[]>();

  // Simulate market data
  useEffect(() => {
    setTimeout(() => {
      const data = generateData(props?.growthPercent, props?.yearsToSimulate, props?.nois);
      setData(data);
    }, 1000 * props?.delay ?? 0)
  }, [props?.yearsToSimulate, props?.noise, props?.growthPercent])

  return <Component snpData={data} params={params} />;
}


function generateData(growthPercent = 10, yearsToSimulate = 10, noise = 0.1): MarketData[] {
  const monthStart = DateTime.now().set({
    day: 1,
    hour: 0,
    second: 0,
    millisecond: 0,
  })
  const startingVal = 100;
  const growth = growthPercent / (12 * 100);
  const totalMonths = yearsToSimulate * 12;
  return range(0, totalMonths).map(idx => {
    let value = startingVal * Math.pow(1 + growth, idx);
    // Add some random noise
    value = value * (Math.random() * noise + (1 - (noise / 2)));
    return {
      Date: monthStart.minus({month: totalMonths - idx}),
      P: value,
      E: 0,
      D: value * 0.02
    }
  })
}
