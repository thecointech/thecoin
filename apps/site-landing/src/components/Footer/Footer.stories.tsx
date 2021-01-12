import React from 'react';
import { Story, Meta } from '@storybook/react';

import { Footer } from '.';

import { MemoryRouter } from 'react-router';
import { Provider, ProviderProps } from 'react-redux';
import history from '@the-coin/shared/build/utils/history';
import {configureAppStore} from '@the-coin/shared/build/configureStore';
import createReducer from '../../reducers';
import { AnyAction } from 'redux';


const store = configureAppStore(createReducer, undefined, history);

export default {
  title: 'Landing/Footer',
  component: Footer,
  decorators: [(Story) => <Provider store={store}><MemoryRouter><Story/></MemoryRouter></Provider>],
  argTypes: {}
} as Meta;

const Template = () => <Footer />;

export const Both: Story<ProviderProps<AnyAction>> = Template.bind({});
Both.args = {};
