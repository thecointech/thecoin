import React from 'react';
import { StoryFn, Meta } from '@storybook/react-webpack5';

import { Header, StrictHeaderProps } from 'semantic-ui-react';
import "@thecointech/site-semantic-theme/semantic.less"


export default {
  title: 'SemanticUI/Headers',
  component: Header,
  args: {
    content: "The future is brighter"
  }
} as Meta;

const Template: StoryFn<StrictHeaderProps> = (args) => <Header as={args.as} >{args.content}<Header.Subheader>{args.content}</Header.Subheader></Header>;

export const H1 = Template.bind({});
H1.args = {
  as: 'h1',
};
export const H2 = Template.bind({});
H2.args = {
  as: 'h2',
};
export const H3 = Template.bind({});
H3.args = {
  as: 'h3',
};
export const H4 = Template.bind({});
H4.args = {
  as: 'h4',
};
export const H5 = Template.bind({});
H5.args = {
  as: 'h5',
};
