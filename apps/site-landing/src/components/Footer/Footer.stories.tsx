import React from 'react';
import { StoryFn, Meta } from '@storybook/react-webpack5';
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

export const Footer: StoryFn = () => (
  <div id={styles.landing}>
    <Component />
  </div>
)

