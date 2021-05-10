import React from 'react';
import { Meta } from '@storybook/react';
import { MainNavigation } from '.';
import { withAccounts, withLanguageProvider, withMediaContext } from '@thecointech/storybookutils';

export default {
  title: 'App/Header',
  component: MainNavigation,
  decorators: [
    withMediaContext,
    withLanguageProvider,
    withAccounts({
      active: null,
      map: {}
    }),
  ]
} as Meta;

export const Header = () => <MainNavigation />;
