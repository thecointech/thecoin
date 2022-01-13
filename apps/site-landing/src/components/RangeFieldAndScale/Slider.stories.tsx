import React from 'react';
import { Story, Meta } from '@storybook/react';

import { RangeFieldAndScale, Props } from '.';

export default {
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
  args: {
    label: "Label",
    currency: "CAD",
    scaleType: "currency",
    minimum: 0,
    maximum: 100,
    step: 1,
  }
} as Meta;

export const Slider: Story<Props> = (props) => <RangeFieldAndScale {...props} />
