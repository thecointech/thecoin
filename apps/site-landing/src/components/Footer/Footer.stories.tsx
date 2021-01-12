import React from 'react';
import { Story, Meta } from '@storybook/react';

import { Footer } from '.';

import { ProviderProps } from 'react-redux';
import { AnyAction } from 'redux';

export default {
  title: 'Landing/Footer',
  component: Footer,
  argTypes: {}
} as Meta;

const Template = () => <Footer />;

export const Both: Story<ProviderProps<AnyAction>> = Template.bind({});
Both.args = {};
