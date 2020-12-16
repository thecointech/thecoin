import React from 'react';
import { Story, Meta } from '@storybook/react';
import { ButtonPrimary, ButtonSecondary, ButtonTertiary, ArgsButton } from '../libs/site-base/src/components/Buttons';
import "@the-coin/site-base/build/styles/semantic.less";

export default {
  title: 'Button',
  component: ButtonPrimary,ButtonSecondary,ButtonTertiary,
  argTypes: {
    content: { control: 'text' },
    active: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
} as Meta;

const TemplatePrimary: Story<ArgsButton> = (args) => <ButtonPrimary {...args} />;
const TemplateSecondary: Story<ArgsButton> = (args) => <ButtonSecondary {...args} />;
const TemplateTertiary: Story<ArgsButton> = (args) => <ButtonTertiary {...args} />;


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
