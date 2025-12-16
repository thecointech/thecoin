import React from 'react';
import { StoryFn, Meta } from '@storybook/react-webpack5';
import { Wealthier as Component } from '.';
import styles from '../styles.module.less';

export default {
  title: 'Landing/Homepage/Wealthier',
  component: Component,
} as Meta;


export const Wealthier: StoryFn = () => (
  <div className={styles.pageContainer}>
    <Component />
  </div>
);
