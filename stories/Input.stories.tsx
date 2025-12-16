import React from 'react';
import { StoryFn, Meta } from '@storybook/react-webpack5';
import { Input, InputProps } from './Input';

export default {
  title: 'SemanticUI/Input',
  component: Input,
  argTypes: {
    error: { control: "boolean" }
  }
} as Meta;

const Template: StoryFn<InputProps> = (args) => <Input {...args} />;

export const Basic = Template.bind({});
Basic.args = {
  label: "input label",
  placeholder: "placeholder text",
  error: false,
};


export const Error = Template.bind({});
Error.args = {
  label: "Label",
  placeholder: "placeholder",
  error: true,
};
