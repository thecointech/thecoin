import React from 'react';
import { Story, Meta } from '@storybook/react';
import { Advantages as Component } from '.';
import styles from '../styles.module.less';

export default {
  title: 'Landing/Homepage/Advantages',
  component: Component,
} as Meta;

export const Advantages: Story = () => (
  <div className={styles.pageContainer}>
    <Component />
  </div>
);
