import React from 'react';
import { StoryFn, Meta } from '@storybook/react-webpack5';

import { Font, FontProps } from './Font';

export default {
  title: 'SemanticUI/Font',
  component: Font,
  args: {
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  }
} as Meta;

const Template: StoryFn<FontProps> = (args) => <Font {...args} />;

export const Basic = Template.bind({});
Basic.args = {
  classname: ""
}

export const Big = Template.bind({});
Big.args = {
  classname: "font-big"
}

export const Small = Template.bind({});
Small.args = {
  classname: "font-small"
}

export const Black = Template.bind({});
Black.args = {
  classname: "font-black"
}

export const Label = Template.bind({});
Label.args = {
  classname: "ui label"
}
