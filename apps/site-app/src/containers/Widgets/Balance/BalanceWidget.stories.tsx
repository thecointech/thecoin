import React from 'react';
import { Meta } from '@storybook/react';
import { BalanceWidget as Component } from '.';
import { withAccounts, withReducer } from '@thecointech/storybookutils';
import { FxRateReducer } from '@thecointech/shared/containers/FxRate';
import styles from '../../App/styles.module.less';

export default {
  title: 'App/Widgets/Balance',
  component: Component,
  decorators: [
    withReducer(FxRateReducer),
    withAccounts()
  ]
} as Meta;

export const Balance = () => (
  <div id={styles.app}>
    <Component />
  </div>
);
