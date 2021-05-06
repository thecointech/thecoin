import React from 'react';
import { Story, Meta } from '@storybook/react';

import { RangeFieldAndScale, Props } from '.';

export default {
  title: 'Shared/RangeFieldAndScale',
  component: RangeFieldAndScale
} as Meta;

const Template: Story<Props> = (args) => <RangeFieldAndScale {...args} />;

export const Slider = Template.bind({});
Slider.args = {
  labelValue: "Label",
  labelValueCurrency: "$",
  scaleType: "decimal",
  minRange: 0,
  maxRange: 100,
  stepRange: 5,
  minRangeScale: 10,
  medRangeScale: 100,
  maxRangeScale: 1000,
};
