import React from 'react';
import { Story, Meta } from '@storybook/react';

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

export const Small: Story<ProviderProps<AnyAction>> = Template.bind({});
Small.args = {};

export const BigPeople: Story<ProviderProps<AnyAction>> = TemplateBigPeople.bind({});
BigPeople.args = {};

export const BigPlants: Story<ProviderProps<AnyAction>> = TemplateBigPlant.bind({});
BigPlants.args = {};
