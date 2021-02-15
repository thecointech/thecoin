import React from 'react';
import { Story, Meta } from '@storybook/react';
import { HistoryGraph } from '.';
import { Tooltip as GraphTooltip } from './Tooltip';

export default {
  title: 'App/HistoryGraph',
  component: HistoryGraph,
} as Meta;

const graph: Story<void> = () => <HistoryGraph />;
export const Graph = graph.bind({});

// Data scraped from live graph
const tooltipArgs = {
  x:"2021-01-14T06:00:00.000Z",
  y:25028.368465015625,
  costBasis:21297.11,
  txs:[], // TODO: scrap one with txs
  xFormatted:"2021-01-14",
  yFormatted:25028.368465015625
}
const tooltip: Story<typeof tooltipArgs> = (props) => (
  // wrap in absolute div to mimic graph behaviour
  <div style={{position: 'absolute'}}>
    <GraphTooltip point={{data: props}}/>
  </div>
)
export const Tooltip = tooltip.bind({});
Tooltip.args = tooltipArgs;
