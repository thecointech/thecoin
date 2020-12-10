import React from 'react';
import { Story, Meta } from '@storybook/react';

import { Button, StrictButtonProps } from 'semantic-ui-react';
import "@the-coin/site-base/build/styles/semantic.less"


export default {
  title: 'SemanticUI/Button',
  component: Button,
  argTypes: {
    primary: { control: 'boolean' },
    content: { control: 'text' }
  },
} as Meta;

const Template: Story<StrictButtonProps> = (args) => <Button {...args} />;

export const Basic = Template.bind({});
Basic.args = {
  content: 'Button',
  active: false,
  disabled: false,
};

export const Primary = Template.bind({});
Primary.args = {
  primary: true,
  content: 'Button',
  active: false,
  disabled: false,
};

export const Secondary = Template.bind({});
Secondary.args = {
  secondary: true,
  content: 'Button',
  active: false,
  disabled: false,
};
