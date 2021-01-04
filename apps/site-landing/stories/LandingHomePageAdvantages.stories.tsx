import React from 'react';
import { Story, Meta } from '@storybook/react';

import { Advantages } from '../src/containers/HomePage/advantages';

import { MemoryRouter } from 'react-router';
import { Provider, ProviderProps } from 'react-redux';
import history from '@the-coin/shared/build/utils/history';
import {configureAppStore} from '@the-coin/shared/build/configureStore';
import {createReducer} from '../../admin/app/reducers';


const store = configureAppStore(createReducer, undefined, history);

export default {
  title: 'Landing/Homepage/Advantages',
  component: Advantages,
  decorators: [(Story) => <Provider store={store}><MemoryRouter><Story/></MemoryRouter></Provider>],
  argTypes: {}
} as Meta;

const Template: Story<ProviderProps> = () => <Advantages />;

export const Basic = Template.bind({});
Basic.args = {};
