import React from 'react';
import { StoryFn, Meta } from '@storybook/react-webpack5';
import { Advantages as Component } from '.';
import styles from '../styles.module.less';

export default {
  title: 'Landing/Homepage/Advantages',
  component: Component,
} as Meta;

export const Advantages: StoryFn = () => (
  <div className={styles.pageContainer}>
    <Component />
  </div>
);
