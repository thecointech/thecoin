import React from 'react';
import { Meta } from '@storybook/react-webpack5';
import { Footer as FooterComponent } from '.';

export default {
  title: 'NFT/Footer',
  component: FooterComponent,
} as Meta;

export const Footer = () => <FooterComponent />;
