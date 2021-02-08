import React from 'react';
import { Story, Meta } from '@storybook/react';

import { LandscapeGreaterThanMobile } from './LandscapeGreaterThanMobile';
import { LandscapeMobile } from './LandscapeMobile';

import { ProviderProps } from 'react-redux';
import { AnyAction } from 'redux';

export default {
  title: 'Landing/Homepage/Landscape',
  component: LandscapeGreaterThanMobile,
  argTypes: {}
} as Meta;

const Template = () => <LandscapeGreaterThanMobile mainTitle={"The future is brighter"} mainDescription={"Save, invest and spend money with TheCoin, get 100% of benefits and save our Planet."} mainButton={"Start Now"} />;
const TemplateMobile = () => <LandscapeMobile mainTitle={"The future is brighter"} mainDescription={"Save, invest and spend money with TheCoin, get 100% of benefits and save our Planet."}  mainButton={"Start Now"} />;

export const Desktop: Story<ProviderProps<AnyAction>> = Template.bind({});
Desktop.args = {};

export const Mobile: Story<ProviderProps<AnyAction>> = TemplateMobile.bind({});
Mobile.args = {};