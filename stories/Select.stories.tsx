import React from 'react';
import { StoryFn, Meta } from '@storybook/react-webpack5';
import { Select, SelectProps } from 'semantic-ui-react'

export default {
  title: 'SemanticUI/Select',
  component: Select,
  argTypes: {
    error: { control: "boolean" },
    disabled: { control: "boolean" }
  }
} as Meta;

const Template: StoryFn<SelectProps> = (args) => <Select {...args} />;
const selectOptions = [
  { key: '1', value: '1', text: 'Option1' },
  { key: '2', value: '2', text: 'Option2' },
  { key: '3', value: '3', text: 'Option3' },
  { key: '4', value: '4', text: 'Option4' },
];

export const Basic = Template.bind({});
Basic.args = {
  placeholder: "Select Option",
  options: selectOptions,
  error: false,
  disabled: false,
};
