import React from 'react';
import { Story, Meta } from '@storybook/react';

import { ClimateImpact } from '.';

import { ProviderProps } from 'react-redux';
import { AnyAction } from 'redux';

export default {
  title: 'App/ClimateImpact',
  component: ClimateImpact,
  argTypes: {}
} as Meta;

const Template = () => <ClimateImpact />;

export const Both: Story<ProviderProps<AnyAction>> = Template.bind({});
Both.args = {};
