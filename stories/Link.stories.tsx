import React from 'react';
import { StoryFn, Meta } from '@storybook/react-webpack5';

import { Link, LinkProps } from './Link';

export default {
  title: 'SemanticUI/Link',
  component: Link,
  args: {
    text: "This is a link",
    onClick: () => {}
  }
} as Meta;

const Template: StoryFn<LinkProps> = (args) => <Link {...args} />;

export const Basic = Template.bind({});
Basic.args = {}
