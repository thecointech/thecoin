import React from 'react';
import { Story, Meta } from '@storybook/react';
import { HistoryGraph } from '.';

export default {
  title: 'App/HistoryGraph',
  component: HistoryGraph,
} as Meta;

const template: Story<void> = () => <HistoryGraph />;

export const Default = template.bind({});
