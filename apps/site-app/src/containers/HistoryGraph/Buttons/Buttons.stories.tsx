import React, { useState } from 'react';
import { Story, Meta } from '@storybook/react';
import { Buttons, Duration } from './';

//import "@the-coin/site-base/styles/semantic.css";

export default {
  title: 'App/GraphButton',
  component: Buttons,
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
  return <Buttons duration={duration} setDuration={setDuration} />;
}

export const Default = template.bind({});
Default.args = {
}
