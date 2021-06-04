import React from 'react';
import { Meta } from '@storybook/react';
import { MainNavigation } from '.';
import { withAccounts, withLanguageProvider, withMediaContext } from '@thecointech/storybookutils';

import styles from '../App/styles.module.less';

export default {
  title: 'NFT/Header',
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

export const Header = () => (
  <div id={styles.app}>
    <MainNavigation />
  </div>
);
