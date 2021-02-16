import React from 'react';
import { Story, Meta } from '@storybook/react';
import { Tooltip as GraphTooltip, TooltipProps } from './Tooltip';
import sampleData from './Tooltip.stories.data.json';
import { DateTime } from 'luxon';

export default {
  title: 'App/HistoryGraphTooltip',
  component: GraphTooltip,
} as Meta;

// Data scraped from live graph
const tooltip: Story<TooltipProps> = (props) => (
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
