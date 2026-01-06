import React from 'react';
import { Meta } from '@storybook/react-webpack5';
import { LanguageSwitcher as LanguageComponent } from '.';
import { withStore, withLanguageProvider } from '@thecointech/storybookutils';

export default {
  title: 'Base/Language',
  component: LanguageComponent,
  decorators: [
    withLanguageProvider,
    withStore(),
  ]} as Meta;

export const Language = () => <LanguageComponent />;
