import React from 'react';
import { Meta } from '@storybook/react-webpack5';
import { CopyToClipboard  } from '.';

export default {
  title: 'Shared/Clipboard',
  component: CopyToClipboard,
} as Meta;

export const Clipboard = () => (
  <CopyToClipboard payload='args'>
    0xA234567890123456789012345678901234567890
  </CopyToClipboard>
);
