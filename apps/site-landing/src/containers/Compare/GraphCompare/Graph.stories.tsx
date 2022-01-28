import React from 'react';
import { Meta } from '@storybook/react';
import { GraphCompare as Component } from '.';

export default {
  title: 'Landing/Calculator/Graph',
  component: Component,
} as Meta;

export const Balance = () => <Component {...{} as any} />
