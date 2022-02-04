import React, { useEffect, useState } from 'react';
import { Meta, Story } from '@storybook/react';
import { BenefitsGraph as Component } from '.';
import { createParams, MarketData } from '../../ReturnProfile/data';
import { generateData } from '../../../../internals/historical/simulation';

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
      const data = generateData(props?.growthPercent, 0, props?.yearsToSimulate, props?.nois);
      setData(data);
    }, 1000 * props?.delay ?? 0)
  }, [props?.yearsToSimulate, props?.noise, props?.growthPercent])

  return <Component snpData={data} params={params} />;
}
