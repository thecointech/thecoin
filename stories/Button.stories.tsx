import React from 'react';
import { StoryFn, Meta } from '@storybook/react-webpack5';
import { ButtonPrimary, ButtonSecondary, ButtonTertiary } from '../libs/site-base/src/components/Buttons';
import { Button, ButtonProps } from 'semantic-ui-react';

import "@thecointech/site-semantic-theme/semantic.less"

export default {
  title: 'SemanticUI/Button',
  component: ButtonPrimary,
  argTypes: {
    content: { control: 'text' },
    active: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
} as Meta;

const TemplatePrimary: StoryFn<ButtonProps> = (args) => <ButtonPrimary {...args} />;
const TemplateSecondary: StoryFn<ButtonProps> = (args) => <ButtonSecondary {...args} />;
const TemplateTertiary: StoryFn<ButtonProps> = (args) => <ButtonTertiary {...args} />;

const TemplateInverted: StoryFn<ButtonProps> = (args) => <Button inverted {...args} />;


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

export const Inverted = TemplateInverted.bind({});
Inverted.args = {
  content: 'Button',
  active: false,
  disabled: false,
};
