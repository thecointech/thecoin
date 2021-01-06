import React from 'react';
import { Story, Meta } from '@storybook/react';

import { LandscapeGreaterThanMobile } from './LandscapeGreaterThanMobile';
import { LandscapeMobile } from './LandscapeMobile';

import { MemoryRouter } from 'react-router';
import { Provider, ProviderProps } from 'react-redux';
import history from '@the-coin/shared/build/utils/history';
import {configureAppStore} from '@the-coin/shared/build/configureStore';
import createReducer from '../../../reducers';
import { AnyAction } from 'redux';

const store = configureAppStore(createReducer, undefined, history);

export default {
  title: 'Landing/Homepage/Landscape',
  component: LandscapeGreaterThanMobile,
  decorators: [(Story) => <Provider store={store}><MemoryRouter><Story/></MemoryRouter></Provider>],
  argTypes: {}
} as Meta;

const Template = () => <LandscapeGreaterThanMobile mainTitle={"The future is brighter"} mainDescription={"Save, invest and spend money with TheCoin, get 100% of benefits and save our Planet."} />;
const TemplateMobile = () => <LandscapeMobile mainTitle={"The future is brighter"} mainDescription={"Save, invest and spend money with TheCoin, get 100% of benefits and save our Planet."} />;

export const Desktop: Story<ProviderProps<AnyAction>> = Template.bind({});
Desktop.args = {};

export const Mobile: Story<ProviderProps<AnyAction>> = TemplateMobile.bind({});
Mobile.args = {};