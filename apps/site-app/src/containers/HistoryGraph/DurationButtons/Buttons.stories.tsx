import React, { useState } from 'react';
import { StoryFn, Meta } from '@storybook/react-webpack5';
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

const template: StoryFn<{text: string}> = () => {
  const [duration, setDuration] = useState(31 as Duration)
  return <DurationButtons duration={duration} setDuration={setDuration} />;
}

export const Default = template.bind({});
Default.args = {
}
