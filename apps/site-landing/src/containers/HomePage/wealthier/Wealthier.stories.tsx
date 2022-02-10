import React from 'react';
import { Story, Meta } from '@storybook/react';
import { Wealthier as Component } from '.';
import styles from '../styles.module.less';

export default {
  title: 'Landing/Homepage/Wealthier',
  component: Component,
} as Meta;


export const Wealthier: Story = () => (
  <div className={styles.pageContainer}>
    <Component />
  </div>
);
