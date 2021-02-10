import React from 'react'
import { Story, Meta } from '@storybook/react';
import { GraphHistory } from '.';
import { Transaction } from '@the-coin/tx-blockchain';
import { DateTime } from 'luxon';


export default {
  title: 'Shared/GraphHistory',
  component: GraphHistory,
  argTypes: {
    lineColor: { control: 'color' }
  },
} as Meta;

const defaultArgs = {
  numDays: 30,
  lineColor: '#61C1B8'
}

const template: Story<typeof defaultArgs> = (args) =>
  <GraphHistory data={genData(args.numDays)} lineColor={args.lineColor} />;

export const Default = template.bind({});
Default.args = defaultArgs;

const genData = (num = 30) => {
  let balance = 100;
  return Array.from({length: num}).map((_, index): Transaction => {
    const change = Math.max((Math.random() - 0.45) * 100, -balance);
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
