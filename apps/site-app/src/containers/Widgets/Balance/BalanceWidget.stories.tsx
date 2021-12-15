import React from 'react';
import { Meta } from '@storybook/react';
import { BalanceWidget as Component } from '.';
import styles from '../../containers/App/styles.module.less';
import { withAccounts } from '@thecointech/storybookutils';

export default {
  title: 'App/Widgets/Balance',
  component: Component,
  decorators: [withAccounts()]
} as Meta;

export const Balance = () => (
  <div id={styles.app}>
    <Component />
  </div>
);
