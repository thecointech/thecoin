import React from 'react';
import { Story, Meta } from '@storybook/react';

import { CreateAccountSmall } from '../HomePage/createAccountSmall';
import { CreateAccountBanner, TypeCreateAccountBanner } from '.';

import { MemoryRouter } from 'react-router';
import { Provider, ProviderProps } from 'react-redux';
import history from '@the-coin/shared/build/utils/history';
import {configureAppStore} from '@the-coin/shared/build/configureStore';
import createReducer from '../../reducers';
import { AnyAction } from 'redux';


const store = configureAppStore(createReducer, undefined, history);

export default {
  title: 'Landing/CreateAccountBanners',
  component: CreateAccountSmall,
  decorators: [(Story) => <Provider store={store}><MemoryRouter><Story/></MemoryRouter></Provider>],
  argTypes: {}
} as Meta;

const Template: Story<ProviderProps> = () => <CreateAccountSmall />;
const TemplateBigPeople: Story<ProviderProps> = () => <CreateAccountBanner Type={ TypeCreateAccountBanner.People } />;
const TemplateBigPlant: Story<ProviderProps> = () => <CreateAccountBanner Type={ TypeCreateAccountBanner.Plants } />;

export const Small: Story<ProviderProps<AnyAction>> = Template.bind({});
Small.args = {};

export const BigPeople: Story<ProviderProps<AnyAction>> = TemplateBigPeople.bind({});
BigPeople.args = {};

export const BigPlants: Story<ProviderProps<AnyAction>> = TemplateBigPlant.bind({});
BigPlants.args = {};
