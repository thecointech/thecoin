import React from 'react';
import { Story, Meta } from '@storybook/react';

import { LandscapeGreaterThanMobile } from '../src/containers/HomePage/landscape/LandscapeGreaterThanMobile';
import { LandscapeMobile } from '../src/containers/HomePage/landscape/LandscapeMobile';

import { MemoryRouter } from 'react-router';
import { Provider, ProviderProps } from 'react-redux';
import history from '@the-coin/shared/build/utils/history';
import {configureAppStore} from '@the-coin/shared/build/configureStore';
import {createReducer} from '../../admin/app/reducers';


const store = configureAppStore(createReducer, undefined, history);

export default {
  title: 'Landing/Homepage/Landscape',
  component: LandscapeGreaterThanMobile,
  decorators: [(Story) => <Provider store={store}><MemoryRouter><Story/></MemoryRouter></Provider>],
  argTypes: {}
} as Meta;

const Template: Story<ProviderProps> = () => <LandscapeGreaterThanMobile mainTitle={"The future is brighter"} mainDescription={"Save, invest and spend money with TheCoin, get 100% of benefits and save our Planet."} />;
const TemplateMobile: Story<ProviderProps> = () => <LandscapeMobile mainTitle={"The future is brighter"} mainDescription={"Save, invest and spend money with TheCoin, get 100% of benefits and save our Planet."} />;

export const Desktop = Template.bind({});
Desktop.args = {};

export const Mobile = TemplateMobile.bind({});
Mobile.args = {};