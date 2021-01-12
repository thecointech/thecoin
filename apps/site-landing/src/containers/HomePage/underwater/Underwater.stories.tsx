import React from 'react';
import { Story, Meta } from '@storybook/react';

import { Underwater } from './UnderwaterGreaterThanMobile';
import { UnderwaterMobile } from './UnderwaterMobile';

import { ProviderProps } from 'react-redux';
import { AnyAction } from 'redux';

export default {
  title: 'Landing/Homepage/Underwater',
  component: Underwater,
  argTypes: {}
} as Meta;

const Template = () => <Underwater />;
const TemplateMobile = () => <UnderwaterMobile />;

export const Desktop: Story<ProviderProps<AnyAction>> = Template.bind({});
Desktop.args = {};

export const Mobile: Story<ProviderProps<AnyAction>> = TemplateMobile.bind({});
Mobile.args = {};