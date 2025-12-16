import React from 'react';
import { Meta } from '@storybook/react-webpack5';
import { CopyToClipboard } from '.';
import { languageDecorator } from '../../../internal/languageDecorator';

export default {
  title: 'Shared/Clipboard',
  component: CopyToClipboard,
  decorators: languageDecorator
} as Meta;

export const Clipboard = () => (
  <CopyToClipboard payload='args'>
    0xA234567890123456789012345678901234567890
  </CopyToClipboard>
);
