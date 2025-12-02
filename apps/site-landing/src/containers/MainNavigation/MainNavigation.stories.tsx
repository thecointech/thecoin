import React from 'react';
import { Meta } from '@storybook/react-webpack5';
import { MainNavigation } from '.';
import { withStore, withLanguageProvider, withMediaContext } from '@thecointech/storybookutils';
import styles from '../App/styles.module.less';

export default {
  title: 'Landing/Navigation',
  component: MainNavigation,
  decorators: [
    withMediaContext,
    withLanguageProvider,
    withStore(),
  ]
} as Meta;

export const Navigation = () => (
  <div id={styles.landing}>
    <MainNavigation />
  </div>
);
