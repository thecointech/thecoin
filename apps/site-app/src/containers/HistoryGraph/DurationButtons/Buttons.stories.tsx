import React, { useState } from 'react';
import { StoryFn, Meta } from '@storybook/react-webpack5';
import { DurationButtons } from '.';
import { DateTime } from 'luxon';

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
  const [fromDate, setFromDate] = useState(DateTime.local());
  const [toDate, setToDate] = useState(DateTime.local());
  return <DurationButtons fromDate={[fromDate, setFromDate]} toDate={[toDate, setToDate]} />;
}

export const Default = template.bind({});
Default.args = {
}
