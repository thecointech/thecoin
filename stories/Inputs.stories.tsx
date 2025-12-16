import React from 'react';
import { StoryFn, Meta } from '@storybook/react-webpack5';

import { Input, InputProps } from 'semantic-ui-react';
import "@thecointech/site-semantic-theme/semantic.less"


export default {
  title: 'SemanticUI/Inputs',
  component: Input,
  argTypes: {
    content: { control: 'text' },
    disabled: { control: 'boolean' },
  },
} as Meta;

const Template: StoryFn<InputProps> = (args) => <Input {...args} />;

export const InputField = Template.bind({});
InputField.args = {
  content: 'Field',
  disabled: false,
  loading: false,
  focus: true,
  error: false,
  placeholder: "Text here..."
};

