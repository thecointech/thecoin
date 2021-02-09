/*
 * This file is part of the nivo project.
 *
 * Copyright 2016-present, Raphaël Benitte.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import React from 'react'
import { Story, Meta } from '@storybook/react';
import { GraphHistory } from '.';
import { Transaction } from '@the-coin/tx-blockchain';
import { DateTime } from 'luxon';


export default {
  title: 'Shared/GraphHistory',
  component: GraphHistory,
  argTypes: {
    content: { control: 'text' },
    active: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
} as Meta;

const defaultArgs = {
  numDays: 30,
}
const template: Story<typeof defaultArgs> = (args) => <GraphHistory data={genData(args.numDays)} />;

export const Default = template.bind(defaultArgs);


const genData = (num = 30) => {
  let balance = 100;
  return new Array(num).map((_, index): Transaction => {
    const change = Math.max((Math.random() - 0.5) * 100, 0);
    balance += change;
    return {
      balance,
      change,
      date: DateTime.fromObject({year: 2020, month: 1, day: index}),
      logEntry: "Transaction",
      counterPartyAddress: "0x12345",
    }
  })
}

// stories.add('area gradients', () => (
//   <Line
//       {...commonProperties}
//       enableArea={true}
//       yScale={{
//           type: 'linear',
//           stacked: true,
//       }}
//       curve={select('curve', curveOptions, 'linear')}
//       defs={[
//           linearGradientDef('gradientA', [
//               { offset: 0, color: 'inherit' },
//               { offset: 100, color: 'inherit', opacity: 0 },
//           ]),
//       ]}
//       fill={[{ match: '*', id: 'gradientA' }]}
//   />
// ))


// type CustomSymbolProps = {
//   size: number,
//   color: string,
//   borderWidth: number,
//   borderColor: string,
// }
// const CustomSymbol = ({ size, color, borderWidth, borderColor }: CustomSymbolProps) => (
//     <g>
//         <circle fill="#fff" r={size / 2} strokeWidth={borderWidth} stroke={borderColor} />
//         <circle
//             r={size / 5}
//             strokeWidth={borderWidth}
//             stroke={borderColor}
//             fill={color}
//             fillOpacity={0.35}
//         />
//     </g>
// )

// const stories = storiesOf('Line', module)
