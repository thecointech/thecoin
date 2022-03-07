import React from 'react';
import { Story, Meta } from '@storybook/react';
import { Healthier as Component } from '.';
import styles from '../styles.module.less';

export default {
  title: 'Landing/Homepage/Healthier',
  component: Component,
} as Meta;

export const Healthier: Story = () => (
  <div className={styles.pageContainer}>
    <Component />
  </div>
);
