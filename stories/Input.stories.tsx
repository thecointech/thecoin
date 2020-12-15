import React from 'react';
import { Story, Meta } from '@storybook/react';
import { Input, InputProps } from './Input';

export default {
  title: 'SemanticUI/Input',
  component: Input,
} as Meta;

const Template: Story<InputProps> = (args) => <Input {...args} />;

export const Basic = Template.bind({});
Basic.args = {
  label: "input label",
  placeholder: "placeholder text"
};
