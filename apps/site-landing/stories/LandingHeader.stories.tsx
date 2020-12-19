import React from 'react';
import { Story, Meta } from '@storybook/react';

import MainNavigation from '../src/containers/MainNavigation';
import { MemoryRouter } from 'react-router';
import { Provider, ProviderProps } from 'react-redux';
import history from '../../../libs/shared/src/utils/history';
import {configureAppStore} from '../../../libs/shared/src/configureStore';
import {createReducer} from '../../admin/app/reducers';


const store = configureAppStore(createReducer, undefined, history);

export default {
  title: 'Landing/MainNavigation',
  component: MainNavigation,
  decorators: [(Story) => <Provider store={store}><MemoryRouter><Story/></MemoryRouter></Provider>],
  argTypes: {}
} as Meta;

const Template: Story<ProviderProps> = (args) => <MainNavigation {...args} />;

export const Basic = Template.bind({});
Basic.args = {};