import React from 'react'
import { Story, Meta } from '@storybook/react';
import { GraphTxHistory } from '.';
import { Transaction } from '@thecointech/tx-blockchain';
import { DateTime } from 'luxon';
//import { FXRate } from 'containers/FxRate/types';

export default {
  title: 'Shared/GraphTxHistory',
  component: GraphTxHistory,
  argTypes: {
    lineColor: { control: 'color' },
    from: { control: 'date' },
    to: { control: 'date' }
  },
} as Meta;

const days = 24 * 60 * 60 * 1000;
const defaultArgs = {
  from: Date.now() - (30 * days),
  to: Date.now(),
  txFrequency: 5,
  theme: {
    colors: ['#61C1B8'],
    dotColor: "#138175"
  }
}

const template: Story<typeof defaultArgs> = (args) =>
  <GraphTxHistory
    height={350}
    txs={genTxs(args)}
    from={DateTime.fromMillis(args.from)}
    to={DateTime.fromMillis(args.to)}
    theme={args.theme}
  />;

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
      balance,
      change,
      date: DateTime.fromMillis(date),
      logEntry: "Transaction",
      counterPartyAddress: "0x12345",
    })
    balance += change;
    // Increment at random increment
    date += Math.random() * incr;
  }
  return r;
}

// TODO: Move this commented code into a mocked fxRates store
// const genFxRates = ({from, to}: typeof defaultArgs) => {
//   let now = to + 10 * days; // Add more time just to ensure limits work
//   let date = from - 10 * days;  // Add 10 days warm up to ensure randomness
//   const r : FXRate[] = [];
//   const incr = days / 4; // roughly 4 updates per day
//   while (date < now) {
//     // Up to 0.1 % change per day
//     const ex = 1 + (0.1 * (Math.random() - 0.45))
//     r.push({
//       buy: ex - 0.01,
//       sell: ex + 0.01,
//       fxRate: 1,
//       validFrom: date,
//       validTill: date + incr,
//     })
//     date = date + incr;
//   }
//   return r;
// }
