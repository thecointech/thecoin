import React from 'react';
import { Story, Meta } from '@storybook/react';
import { ButtonPrimary, ButtonSecondary, ButtonTertiary } from '../libs/site-base/src/components/Buttons';


import { Button, StrictButtonProps } from 'semantic-ui-react';
import "@the-coin/site-base/build/styles/semantic.less";

export default {
  title: 'SemanticUI/Button',
  component: Button,
  argTypes: {
    content: { control: 'text' }
  },
} as Meta;

const Template: Story<StrictButtonProps> = (args) => <Button {...args} />;
const TemplatePrimary: Story<StrictButtonProps> = (args) => <ButtonPrimary {...args} />;
const TemplateSecondary: Story<StrictButtonProps> = (args) => <ButtonSecondary {...args} />;
const TemplateTertiary: Story<StrictButtonProps> = (args) => <ButtonTertiary {...args} />;

export const Basic = Template.bind({});
Basic.args = {
  content: 'Button',
  active: false,
  disabled: false,
};

export const Primary = TemplatePrimary.bind({});
Primary.args = {
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

export const Tertiary = TemplateTertiary.bind({});
Tertiary.args = {
  content: 'Button',
  active: false,
  disabled: false,
};
