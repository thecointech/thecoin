import React from 'react';
import { Meta } from '@storybook/react-webpack5';
import { Footer as Component } from '.';
import styles from '../../containers/App/styles.module.less';

export default {
  title: 'App/Footer',
  component: Component,
} as Meta;

export const Footer = () => (
  <div id={styles.app}>
    <Component />
  </div>
);
