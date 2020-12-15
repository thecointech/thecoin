import React from 'react';
import { Story, Meta } from '@storybook/react';

import { Button, StrictButtonProps } from 'semantic-ui-react';
import "@the-coin/site-base/build/styles/semantic.less";
import { ButtonSecondary } from '../libs/site-base/src/components/ButtonSecondary/index';


export default {
  title: 'SemanticUI/Button',
  component: Button, ButtonSecondary,
  argTypes: {
    content: { control: 'text' },
    active: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
} as Meta;

const Template: Story<StrictButtonProps> = (args) => <Button {...args} />;
const TemplateSecondary: Story<StrictButtonProps> = (args) => <ButtonSecondary {...args} />;

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

export const Secondary = TemplateSecondary.bind({});
Secondary.args = {
  content: 'Button',
  active: false,
  disabled: false,
};


export const Tertiary = Template.bind({});
Tertiary.args = {
  secondary: true,
  content: 'Button',
  active: false,
  disabled: false,
};
