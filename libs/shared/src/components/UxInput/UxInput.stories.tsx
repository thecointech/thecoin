import React from 'react';
import { Story, Meta } from '@storybook/react';
import { UxInput } from './';
import { Props } from './types';
import { Button, Form } from 'semantic-ui-react';
import { UxPassword } from '../../components/UxPassword';
import { UxAddress } from '../../components/UxAddress';

export default {
  title: 'shared/UxInput',
  component: UxInput,
  argTypes: {
    error: { control: "boolean" }
  }
} as Meta;

const Template: Story<Props> = (args) => <Form>
                                            <br /><br />
                                            <UxInput {...args} />
                                            <UxPassword {...args} />
                                            <UxAddress {...args} />
                                            <Button>Click Here</Button>
                                          </Form>;

export const Basic = Template.bind({});
Basic.args = {
  placeholder: "placeholder text",
  intlLabel: "Test for the input",
  error: false,
  message: { id:"shared.uxinput.storybook.message", defaultMessage:"Test for the message" },
  tooltip: { id:"shared.uxinput.storybook.tooltip", defaultMessage:"Test for the tooltip" }
};
