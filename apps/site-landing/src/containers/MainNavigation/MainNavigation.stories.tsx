import React from 'react';
import { Meta } from '@storybook/react';
import { MainNavigation } from '.';
import { withStore, withLanguageProvider, withMediaContext } from '@thecointech/storybookutils';

export default {
  title: 'Landing/Header',
  component: MainNavigation,
  decorators: [
    withMediaContext,
    withLanguageProvider,
    withStore(),
  ]
} as Meta;

export const Header = () => <MainNavigation />;
