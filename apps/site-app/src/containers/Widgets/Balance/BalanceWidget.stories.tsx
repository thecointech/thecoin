import React from 'react';
import { Meta } from '@storybook/react-webpack5';
import { BalanceAndProfit as Component } from './Widget';
import { withAccounts, withReducer } from '@thecointech/storybookutils';
import { FxRateReducer } from '@thecointech/shared/containers/FxRate';
import styles from '../../App/styles.module.less';
import { WidgetWrapper } from '../index';

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
    <WidgetWrapper area="top">
      <Component />
    </WidgetWrapper>
  </div>
);
