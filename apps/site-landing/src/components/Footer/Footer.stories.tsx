import React from 'react';
import { Story, Meta } from '@storybook/react';
import { Footer as Component } from '.';
import styles from '../../containers/App/styles.module.less';
import { withLanguageProvider, withStore } from '@thecointech/storybookutils';

export default {
  title: 'Landing/Footer',
  component: Component,
  decorators: [
    withLanguageProvider,
    withStore(),
  ]
} as Meta;

export const Footer: Story = () => (
  <div id={styles.landing}>
    <Component />
  </div>
)

