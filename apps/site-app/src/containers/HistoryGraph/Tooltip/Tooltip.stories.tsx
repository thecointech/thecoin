import React from 'react';
import { StoryFn, Meta } from '@storybook/react-webpack5';
import { Tooltip as GraphTooltip, TooltipProps } from './Tooltip';
import sampleData from './Tooltip.stories.data.json';
import { DateTime } from 'luxon';
import { withStore } from '@thecointech/storybookutils';

export default {
  title: 'App/HistoryGraphTooltip',
  component: GraphTooltip,
} as Meta;

// Data scraped from live graph
const tooltip: StoryFn<TooltipProps> = (props) => (
  // wrap in absolute div to mimic graph behaviour
  <div style={{position: 'absolute'}}>
    <GraphTooltip {...props} />
  </div>
)
export const Tooltip = tooltip.bind({});
Tooltip.args = {
  point: {
    data: {
      ...sampleData,
      txs: sampleData.txs.map(tx => ({
        ...tx,
        date: DateTime.fromISO(tx.date)
      }))
    }
  }
}

Tooltip.decorators = [
  withStore({
    fxRates: {
      rates: [{
        buy: 1,
        sell: 1,
        fxRate: 1,
        validFrom: 0,
        validTill: 1800000000000,
        target: 124
      }],
      fetching: 0,
    }
  }),
]
