import React from 'react';
import { Story, Meta } from '@storybook/react';

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

const Template: Story<InputProps> = (args) => <Input {...args} />;

export const InputField = Template.bind({});
InputField.args = {
  content: 'Field',
  disabled: false,
  loading: false,
  focus: true,
  error: false,
  placeholder: "Text here..."
};

