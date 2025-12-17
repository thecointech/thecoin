import React from 'react';
import { Meta } from '@storybook/react-webpack5';
import { MainNavigation } from '.';
import { withAccounts, withLanguageProvider, withMediaContext } from '@thecointech/storybookutils';

import styles from '../App/styles.module.less';

export default {
  title: 'NFT/Navigation',
  component: MainNavigation,
  decorators: [
    withMediaContext,
    withLanguageProvider,
    withAccounts(),
  ]
} as Meta;

export const Navigation = () => (
  <div id={styles.app}>
    <MainNavigation />
  </div>
);
