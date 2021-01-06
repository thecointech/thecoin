import React from 'react';
import { Story, Meta } from '@storybook/react';

import { Underwater } from './UnderwaterGreaterThanMobile';
import { UnderwaterMobile } from './UnderwaterMobile';

import { MemoryRouter } from 'react-router';
import { Provider, ProviderProps } from 'react-redux';
import history from '@the-coin/shared/build/utils/history';
import {configureAppStore} from '@the-coin/shared/build/configureStore';
import createReducer from '../../../reducers';
import { AnyAction } from 'redux';

const store = configureAppStore(createReducer, undefined, history);

export default {
  title: 'Landing/Homepage/Underwater',
  component: Underwater,
  decorators: [(Story) => <Provider store={store}><MemoryRouter><Story/></MemoryRouter></Provider>],
  argTypes: {}
} as Meta;

const Template = () => <Underwater />;
const TemplateMobile = () => <UnderwaterMobile />;

export const Desktop: Story<ProviderProps<AnyAction>> = Template.bind({});
Desktop.args = {};

export const Mobile: Story<ProviderProps<AnyAction>> = TemplateMobile.bind({});
Mobile.args = {};