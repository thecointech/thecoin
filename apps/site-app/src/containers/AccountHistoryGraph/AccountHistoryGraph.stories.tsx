import React from 'react';
import { Story, Meta } from '@storybook/react';
import { AccountHistoryGraph } from '.';

export default {
  title: 'App/AccountHistoryGraph',
  component: AccountHistoryGraph,
} as Meta;

const template: Story<void> = () => <AccountHistoryGraph />;

export const Default = template.bind({});
