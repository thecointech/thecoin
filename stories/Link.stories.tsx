import React from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';

import { Link, LinkProps } from './Link';

export default {
  title: 'SemanticUI/Link',
  component: Link,
  argTypes: {
    text: { control: 'text', default: 'This is a link' }
  },
} as Meta;

const Template: Story<LinkProps> = (args) => <Link {...args} />;

export const Basic = Template.bind({});
Basic.args =  {}
