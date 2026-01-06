import React, { useEffect, useState } from 'react';
import { Meta, StoryFn } from '@storybook/react-webpack5';
import { BenefitsGraph as Component } from '.';
import { createParams, MarketData } from '../simulator';
//@ts-ignore
import { generateData } from '../../../../internals/historical/simulation';
import styles from '../styles.module.less';
import { withReducer, withStore } from '@thecointech/storybookutils';
import { BenefitsReducer } from '../reducer';

const meta: Meta = {
  title: 'Landing/Benefits/Graph',
  args: {
    loadingDelay: 2, // simulated delay of loading data.
    growthPercent: 9,
    yearsToDisplay: 3,
    yearsToSimulate: 20,
    noise: 0.1,
  },
  decorators: [
    withReducer(BenefitsReducer),
    withStore(),
  ]
}
export default meta;
type Props = typeof meta.args;

const params = createParams({initialBalance: 1000});
export const Graph: StoryFn<Props> = (props) => {
  const [data, setData] = useState<MarketData[]>();

  // Simulate market data
  useEffect(() => {
    setTimeout(() => {
      const data = generateData(props?.growthPercent, 0, props?.yearsToSimulate, props?.noise);
      setData(data);
    }, 1000 * props?.delay ?? 0)
  }, [props?.yearsToSimulate, props?.noise, props?.growthPercent])

  return (
    <div className={styles.graphContainer} style={{width: "600px", height: "400px"}}>
      <Component snpData={data} years={props?.yearsToDisplay ?? 10} params={params} />
    </div>
  );
}
