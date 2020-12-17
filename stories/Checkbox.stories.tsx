import React from 'react';
import { Story, Meta } from '@storybook/react';
import { Checkbox, StrictCheckboxProps } from 'semantic-ui-react'

export default {
  title: 'SemanticUI/Checkbox',
  component: Checkbox,
  argTypes: {
    error: { control: "boolean" },
    disabled: { control: "boolean" }
  }
} as Meta;

const Template: Story<StrictCheckboxProps> = (args) => <Checkbox {...args} />;

export const Basic = Template.bind({});
Basic.args = {
  label: "input label",
  error: false,
  disabled: false,
};


export const Error = Template.bind({});
Error.args = {
  label: "Label",
  error: true,
  disabled: false,
};
