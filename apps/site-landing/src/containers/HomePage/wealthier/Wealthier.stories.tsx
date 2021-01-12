import React from 'react';
import { Story, Meta } from '@storybook/react';

import { Wealthier } from '.';

import { ProviderProps } from 'react-redux';
import { AnyAction } from 'redux';

export default {
  title: 'Landing/Homepage/Wealthier',
  component: Wealthier,
  argTypes: {}
} as Meta;

const Template = () => <Wealthier />;

export const Both: Story<ProviderProps<AnyAction>> = Template.bind({});
Both.args = {};
