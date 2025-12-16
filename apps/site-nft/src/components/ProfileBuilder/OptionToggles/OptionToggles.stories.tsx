import React from 'react';
import { Meta } from '@storybook/react-webpack5';
import { OptionToggles as Component } from '.';
import { Options } from '../types';

export default {
  title: 'NFT/OptionToggles',
  component: Component,
} as Meta;

export const Footer = () => {
  const [state, setState] = React.useState<Options>({});
  return <Component state={state} setState={setState} />
}
