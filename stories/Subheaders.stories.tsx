import React from 'react';
import { Story, Meta } from '@storybook/react';

import { Header, StrictHeaderProps } from 'semantic-ui-react';
import "@the-coin/site-base/build/styles/semantic.less"


export default {
  title: 'SemanticUI/Subheaders',
  component: Header,
  args: {
    content: "The future is brighter",
  }
} as Meta;

const Template: Story<StrictHeaderProps> = (args) => <Header>Title h1<Header.Subheader {...args} /></Header>;

export const Subheader = Template.bind({});
Subheader.args = {
  content: 'SubHeader for Header as h1',
};
