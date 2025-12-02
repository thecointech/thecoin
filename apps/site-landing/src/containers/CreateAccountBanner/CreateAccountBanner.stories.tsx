import React from 'react';
import { StoryFn, Meta } from '@storybook/react-webpack5';

import { CreateAccountSmall } from '../HomePage/createAccountSmall';
import { CreateAccountBanner, TypeCreateAccountBanner } from '.';

import { ProviderProps } from 'react-redux';
import { AnyAction } from 'redux';

export default {
  title: 'Landing/CreateAccountBanners',
  component: CreateAccountSmall,
  argTypes: {}
} as Meta;

const Template = () => <CreateAccountSmall />;
const TemplateBigPeople = () => <CreateAccountBanner Type={ TypeCreateAccountBanner.People } />;
const TemplateBigPlant = () => <CreateAccountBanner Type={ TypeCreateAccountBanner.Plants } />;

export const Small: StoryFn<ProviderProps<AnyAction>> = Template.bind({});
Small.args = {};

export const BigPeople: StoryFn<ProviderProps<AnyAction>> = TemplateBigPeople.bind({});
BigPeople.args = {};

export const BigPlants: StoryFn<ProviderProps<AnyAction>> = TemplateBigPlant.bind({});
BigPlants.args = {};
