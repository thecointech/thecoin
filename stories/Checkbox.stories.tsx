import React from 'react';
import { StoryFn, Meta } from '@storybook/react-webpack5';
import { Checkbox, StrictCheckboxProps } from 'semantic-ui-react'

export default {
  title: 'SemanticUI/Checkbox',
  component: Checkbox,
  argTypes: {
    error: { control: "boolean" },
    disabled: { control: "boolean" },
    toggle: { control: "boolean" },
  }
} as Meta;

const Template: StoryFn<StrictCheckboxProps> = (args) => <Checkbox {...args} />;

export const Basic = Template.bind({});
Basic.args = {
  label: "Checkbox label",
  error: false,
  disabled: false,
  toggle: false,
};
