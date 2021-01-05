import React from 'react';
import { Story, Meta } from '@storybook/react';

import { Underwater } from '../src/containers/HomePage/underwater';
import { UnderwaterMobile } from '../src/containers/HomePage/underwater/underwaterMobile';

import { MemoryRouter } from 'react-router';
import { Provider, ProviderProps } from 'react-redux';
import history from '@the-coin/shared/build/utils/history';
import {configureAppStore} from '@the-coin/shared/build/configureStore';
import {createReducer} from '../../admin/app/reducers';


const store = configureAppStore(createReducer, undefined, history);

export default {
  title: 'Landing/Homepage/Underwater',
  component: Underwater,
  decorators: [(Story) => <Provider store={store}><MemoryRouter><Story/></MemoryRouter></Provider>],
  argTypes: {}
} as Meta;

const Template: Story<ProviderProps> = () => <Underwater />;
const TemplateMobile: Story<ProviderProps> = () => <UnderwaterMobile />;

export const Desktop = Template.bind({});
Desktop.args = {};

export const Mobile = TemplateMobile.bind({});
Mobile.args = {};