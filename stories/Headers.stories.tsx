import React from 'react';
import { Story, Meta } from '@storybook/react';

import { Header, StrictHeaderProps } from 'semantic-ui-react';
import "@the-coin/site-base/build/styles/semantic.less"


export default {
  title: 'SemanticUI/Headers',
  component: Header,
  argTypes: {
    primary: { control: 'boolean' },
    content: { control: 'text' },
    as: { control: 'text'}
  },
} as Meta;

const Template: Story<StrictHeaderProps> = (args) => <Header {...args} />;

export const H1 = Template.bind({});
H1.args = {
  content: 'Button',
  as: 'h1',
};
export const H2 = Template.bind({});
H2.args = {
  content: 'Button',
  as: 'h2',
};
export const H3 = Template.bind({});
H3.args = {
  content: 'Button',
  as: 'h3',
};
export const H4 = Template.bind({});
H4.args = {
  content: 'Button',
  as: 'h4',
};
export const H5 = Template.bind({});
H5.args = {
  content: 'Button',
  as: 'h5',
};
