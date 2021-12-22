import React from 'react';
import { Story, Meta } from '@storybook/react';
import { Landscape as Component } from '.';
import styles from '../styles.module.less';

export default {
  title: 'Landing/Homepage/Landscape',
  component: Component,
} as Meta;

export const Landscape: Story = () => (
  <div className={styles.pageContainer}>
    <Component />
  </div>
);
