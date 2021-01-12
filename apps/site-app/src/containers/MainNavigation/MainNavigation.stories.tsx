import React from 'react';
import { Story, Meta } from '@storybook/react';

import MainNavigation from '.';
import { ProviderProps } from 'react-redux';
import { AnyAction } from 'redux';

export default {
  title: 'App/MainNavigation',
  component: MainNavigation,
  argTypes: {}
} as Meta;

const Template = () => <MainNavigation />;

export const Basic: Story<ProviderProps<AnyAction>> = Template.bind({});
Basic.args = {};