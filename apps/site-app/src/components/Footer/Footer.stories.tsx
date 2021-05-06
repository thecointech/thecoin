import React from 'react';
import { Meta } from '@storybook/react';
import { Footer as FooterComponent } from '.';

export default {
  title: 'App/Footer',
  component: FooterComponent,
} as Meta;

export const Footer = () => <FooterComponent />;
