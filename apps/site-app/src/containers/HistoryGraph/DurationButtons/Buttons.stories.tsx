import React, { useState } from 'react';
import { Story, Meta } from '@storybook/react';
import { DurationButtons, Duration } from '.';

export default {
  title: 'App/DurationButtons',
  component: DurationButtons,
  parameters: {
    backgrounds: {
      default: 'graphColor',
      values: [
        { name: 'graphColor', value: '#4EAEA5' },
      ],
    },
  },
} as Meta;

const template: Story<{text: string}> = () => {
  const [duration, setDuration] = useState(31 as Duration)
  return <DurationButtons duration={duration} setDuration={setDuration} />;
}

export const Default = template.bind({});
Default.args = {
}
