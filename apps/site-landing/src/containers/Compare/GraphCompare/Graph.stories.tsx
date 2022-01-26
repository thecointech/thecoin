import React from 'react';
import { Meta } from '@storybook/react';
import { BalanceAndProfit as Component } from './Widget';
import { withAccounts, withReducer } from '@thecointech/storybookutils';
import { FxRateReducer } from '@thecointech/shared/containers/FxRate';
import styles from '../../App/styles.module.less';

export default {
  title: 'Landing/Calculator/Graph',
  component: Component,
  decorators: [
    withReducer(FxRateReducer),
    withAccounts()
  ]
} as Meta;

export const Balance = () => (
  <div id={styles.app}>
    <WidgetWrapper area="top">
      <Component />
    </WidgetWrapper>
  </div>
);
