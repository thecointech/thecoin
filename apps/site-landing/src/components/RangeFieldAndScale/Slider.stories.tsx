import React from 'react';
import { Story } from '@storybook/react';
import { RangeFieldAndScale } from '.';
import { action } from '@storybook/addon-actions';
import { UxNumericType } from '@thecointech/shared';

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
    scaleType: "currency" as UxNumericType,
    minimum: 0,
    maximum: 100,
    step: 1,
  }
};

export default meta;
const onChange = action("on-change");
export const Slider: Story<typeof meta["args"]> = ({ label, ...rest }) => (
  <div style={{ width: '500px' }}>
    <RangeFieldAndScale
      {...rest}
      onChange={onChange}
      label={{ id: 1, defaultMessage: label }}
      tooltip={{ id: 2, defaultMessage: "I'm a tooltip" }}
    />
  </div>
)
