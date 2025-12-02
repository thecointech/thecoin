import React from 'react';
import { StoryFn, Meta } from '@storybook/react-webpack5';
import { Healthier as Component } from '.';
import styles from '../styles.module.less';

export default {
  title: 'Landing/Homepage/Healthier',
  component: Component,
} as Meta;

export const Healthier: StoryFn = () => (
  <div className={styles.pageContainer}>
    <Component />
  </div>
);
