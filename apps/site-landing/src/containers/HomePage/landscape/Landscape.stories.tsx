import React from 'react';
import { Story, Meta } from '@storybook/react';
import { LandscapeGreaterThanMobile } from './LandscapeGreaterThanMobile';
import styles from '../styles.module.less';

export default {
  title: 'Landing/Homepage/Landscape',
  component: LandscapeGreaterThanMobile,
} as Meta;

export const Landscape: Story = () => (
  <div className={styles.pageContainer}>
    <LandscapeGreaterThanMobile />
  </div>
);
