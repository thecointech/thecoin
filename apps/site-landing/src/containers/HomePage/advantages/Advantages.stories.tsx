import React from 'react';
import { Story, Meta } from '@storybook/react';

import { Advantages } from '.';

import { ProviderProps } from 'react-redux';
import { AnyAction } from 'redux';

export default {
  title: 'Landing/Homepage/Advantages',
  component: Advantages,
  argTypes: {}
} as Meta;

const Template = () => <Advantages />;

export const Both: Story<ProviderProps<AnyAction>> = Template.bind({});
Both.args = {};
