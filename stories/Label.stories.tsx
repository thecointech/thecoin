import React from 'react';
import { StoryFn, Meta } from '@storybook/react-webpack5';
import { Label, LabelProps, Input, Form } from 'semantic-ui-react';

import "@thecointech/site-semantic-theme/semantic.less"

export default {
  title: 'SemanticUI/Label',
  component: Label,
  argTypes: {
    content: { control: 'text' },
    circular: { control: 'boolean' },
    icon: { control: 'text' },
    size: {
      control: 'select',
      options: ['mini', 'tiny', 'small', 'medium', 'large', 'big', 'huge', 'massive'],
    },
    basic: { control: 'boolean' },
  },
} as Meta;

const Template: StoryFn<LabelProps> = (args) => {
  // Prevent empty icon from rendering empty icon element inside Label
  const filteredArgs = !args.icon ? { ...args, icon: undefined } : args;
  return <Label {...filteredArgs} />;
};

export const Default = Template.bind({});
Default.args = {
  content: 'Label',
  circular: false,
  icon: '',
  size: 'medium',
  basic: false,
};

export const Circular = Template.bind({});
Circular.args = {
  content: '42',
  circular: true,
  icon: '',
  size: 'medium',
  basic: false,
};

export const WithIcon = Template.bind({});
WithIcon.args = {
  content: 'Mail',
  icon: 'mail',
  circular: false,
  size: 'medium',
  basic: false,
};

export const Basic = Template.bind({});
Basic.args = {
  content: 'Basic Label',
  basic: true,
  circular: false,
  icon: '',
  size: 'medium',
};

export const Large = Template.bind({});
Large.args = {
  content: 'Large Label',
  size: 'large',
  circular: false,
  icon: '',
  basic: false,
};

const InputWithLabelTemplate: StoryFn = () => (
  <Input
    type='text'
    placeholder='Enter text...'
    label={{ content: 'http://', basic: true }}
    labelPosition='left'
  />
);


export const InsideInput = InputWithLabelTemplate.bind({});
InsideInput.storyName = 'Label inside Input';


const FormWithLabelTemplate: StoryFn = () => (
  <Form>
    <Form.Field >
      <Label>Some Text Here</Label>
      <Input
        placeholder="An Input"
      />
    </Form.Field>
  </Form>

)

export const InsideForm = FormWithLabelTemplate.bind({})
InsideForm.storyName = "Label inside Form"
