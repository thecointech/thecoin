import React from 'react';
import { Meta } from '@storybook/react';
import { BalanceWidget as Component } from '.';
import styles from '../../App/styles.module.less';
import { withAccounts, withReducer } from '@thecointech/storybookutils';
import { FxRateReducer } from '@thecointech/shared/containers/FxRate';

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
