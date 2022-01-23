import React from 'react';
import { Story } from '@storybook/react';
import type { NumberFormatOptionsStyle } from '@formatjs/ecma402-abstract';
import { RangeFieldAndScale } from '.';

const meta = {
  title: 'Landing/RangeFieldAndScale',
  component: RangeFieldAndScale,
  parameters: {
    backgrounds: {
      default: 'graphColor',
      values: [
        { name: 'graphColor', value: '#138175' },
      ],
    },
  },
  argTypes: { onChange: { action: 'onChange' } },
  args: {
    label: "Label",
    currency: "CAD" as "CAD",
    scaleType: "currency" as NumberFormatOptionsStyle,
    minimum: 0,
    maximum: 100,
    step: 1,
  }
};

export default meta;
export const Slider: Story<typeof meta["args"]> = ({label, ...rest}) => (
  <RangeFieldAndScale
    {...rest}
    label={{id: 1, defaultMessage: label}}
  />
)
