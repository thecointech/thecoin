import React from 'react';
import { Story, Meta } from '@storybook/react';

import { Link, LinkProps } from './Link';

export default {
  title: 'SemanticUI/Link',
  component: Link,
  args: {
    text: "This is a link",
    onClick: () => {}
  }
} as Meta;

const Template: Story<LinkProps> = (args) => <Link {...args} />;

export const Basic = Template.bind({});
Basic.args = {}
