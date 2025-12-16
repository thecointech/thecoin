import React from 'react';
import { StoryFn, Meta } from '@storybook/react-webpack5';
import { Landscape as Component } from '.';
import styles from '../styles.module.less';

export default {
  title: 'Landing/Homepage/Landscape',
  component: Component,
} as Meta;

export const Landscape: StoryFn = () => (
  <div className={styles.pageContainer}>
    <Component />
  </div>
);
