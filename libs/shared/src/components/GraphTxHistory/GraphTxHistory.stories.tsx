import React from 'react'
import { Story, Meta } from '@storybook/react';
import { GraphTxHistory, Theme } from '.';
import { Transaction } from '@thecointech/tx-blockchain';
import { DateTime } from 'luxon';
import { withStore, withReducer } from '@thecointech/storybookutils';
import { FXRate, FxRateReducer } from 'containers/FxRate';
import { toCoin } from '@thecointech/utilities'
import Decimal from 'decimal.js-light';

export default {
  title: 'Shared/GraphTxHistory',
  component: GraphTxHistory,
  argTypes: {
    lineColor: { control: 'color' },
    from: { control: 'date' },
    to: { control: 'date' }
  },
  decorators: [
    withReducer(FxRateReducer),
    withStore(),
  ]
} as Meta;

const days = 24 * 60 * 60 * 1000;
const defaultArgs = {
  from: Date.now() - (30 * days),
  to: Date.now(),
  txFrequency: 5,
  lineColor: '#61C1B8',
}

const template: Story<typeof defaultArgs> = (args) => {
  const withFxRates = withStore({
    fxRates: {
      rates: genFxRates(args),
      fetching: 0,
    }
  })
  const txs = genTxs(args);
  const theme: Theme = {
    lineColors: [
      args.lineColor,
      'green',
    ],
    dotColor: "#138175"
  }

  const GraphWrapper = () => (
    <GraphTxHistory
      height={350}
      txs={txs}
      from={DateTime.fromMillis(args.from)}
      to={DateTime.fromMillis(args.to)}
      theme={theme}
    />
  )
  return withFxRates(GraphWrapper);
}


export const Default = template.bind({});
Default.args = defaultArgs;

const genTxs = ({from, to, txFrequency}: typeof defaultArgs) => {
  let balance = 100;
  const now = to + 10 * days; // Add more time just to ensure limits work
  let date = from - 10 * days;  // Add 10 days warm up to ensure randomness
  const incr = Math.max(0.5, txFrequency) * days;
  const r : Transaction[] = [];
  while (date < now) {
    const change = Math.max((Math.random() - 0.45) * 100, -balance);
    r.push({
      balance: toCoin(balance),
      change: toCoin(change),
      value: new Decimal(toCoin(change)),
      date: DateTime.fromMillis(date),
      from: "0x12345",
      to: "0x456789",
      txHash: "0x1234567890",
      counterPartyAddress: "0x12345",
    })
    balance += change;
    // Increment at random increment
    date += Math.random() * incr;
  }
  return r;
}

const genFxRates = ({from, to}: {from: number, to: number}) => {
  let now = to + 10 * days; // Add more time just to ensure limits work
  let date = from - 10 * days;  // Add 10 days warm up to ensure randomness
  const r : FXRate[] = [];
  const incr = days / 4; // roughly 4 updates per day
  while (date < now) {
    // Up to 0.1 % change per day
    const ex = 1 + (0.1 * (Math.random() - 0.45))
    r.push({
      buy: ex - 0.01,
      sell: ex + 0.01,
      fxRate: 1,
      target: 124,
      validFrom: date,
      validTill: date + incr,
    })
    date = date + incr;
  }
  return r;
}
