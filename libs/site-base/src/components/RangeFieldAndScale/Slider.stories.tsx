import React from 'react';
import { Story, Meta } from '@storybook/react';

import { RangeFieldAndScale, Props } from '.';

export default {
  title: 'Base/RangeFieldAndScale',
  component: RangeFieldAndScale,
  args: {
    labelValue: "Label",
    labelValueCurrency: "$",
    scaleType: "decimal",
    minimum: 0,
    maximum: 100,
    step: 1,
  }
} as Meta;

export const Slider: Story<Props> = (props) => <RangeFieldAndScale {...props} />
