import React from 'react';
import { LearnMoreLink } from '.';
import { Meta } from '@storybook/react-webpack5';

const meta: Meta = {
  title: "Base/LearnMore",
  component: LearnMoreLink,
  args: { text: "Learn More" }
} as Meta;

export default meta;
export const LearnMore = (args: typeof meta.args) => <LearnMoreLink to=".">{args?.text}</LearnMoreLink>
