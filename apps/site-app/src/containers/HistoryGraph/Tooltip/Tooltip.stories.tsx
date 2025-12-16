import React from 'react';
import { StoryFn, Meta } from '@storybook/react-webpack5';
import { Tooltip as GraphTooltip, TooltipProps } from './Tooltip';
import sampleData from './Tooltip.stories.data.json';
import { DateTime } from 'luxon';
import { withStore, withLanguageProvider } from '@thecointech/storybookutils';
import Decimal from 'decimal.js-light';
import { translations } from '../../../translations';
import { withReducer } from '@thecointech/storybookutils';
import { FxRateReducer } from '@thecointech/shared/containers/FxRate';

export default {
  title: 'App/HistoryGraphTooltip',
  component: GraphTooltip,
  decorators: [
    withLanguageProvider(translations),
    withReducer(FxRateReducer),
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
        inFlight: [],
      }
    }),
  ]
} as Meta;

// Data scraped from live graph
const Template: StoryFn<TooltipProps> = (props) => (
  // wrap in absolute div to mimic graph behaviour
  <div style={{height: '200px'}}>
    <div style={{position: 'absolute'}}>
      <GraphTooltip {...props} />
    </div>
  </div>
);

export const Tooltip = Template.bind({});
Tooltip.args = {
  point: {
    data: {
      ...sampleData,
      x: new Date(sampleData.x),
      raw: sampleData.y - 100,
      txs: sampleData.txs.map(tx => ({
        from: "0x0",
        to: "0x0",
        value: new Decimal(tx.change),
        ...tx,
        date: DateTime.fromISO(tx.date)
      }))
    }
  }
} as TooltipProps;

