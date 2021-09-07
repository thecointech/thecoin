import React, { useState } from 'react';
import { Story, Meta } from '@storybook/react';
import { UxInput } from '.';
import { Button, Form } from 'semantic-ui-react';
import { ValidateCB } from './types';
// import { UxPassword } from '../../components/UxPassword';
// import { UxAddress } from '../../components/UxAddress';

export default {
  title: 'shared/UX/Input',
  component: UxInput,
} as Meta;

const defaultArgs = {
  defaultValue: "",
  validValue: "string match",
  placeholder: "placeholder",
  intlLabel: "Label",
  message: "Error Message: should match validValue",
  tooltip: "Input Tooltip",
};

const makeIntl = (el: string, args: any) => ({ id: el, defaultMessage: args[el] })
const Template: Story<typeof defaultArgs> = (args) => {
  const [value, setValue] = useState<MaybeString>("");
  const [validate, setValidate] = useState(false);

  const onValidate: ValidateCB = (val) => (val == args.validValue) ? null : makeIntl("message", args)

  return (
    <Form style={{paddingTop: 50}}>
      <UxInput
        placeholder={makeIntl("placeholder", args)}
        intlLabel={makeIntl("intlLabel", args)}
        tooltip={makeIntl("tooltip", args)}

        defaultValue={args.defaultValue}
        onValue={setValue}
        onValidate={onValidate}
        forceValidate={validate}
      />
      {/* <UxPassword {...messages} {...args} />
      <UxAddress {...messages} {...args} /> */}
      <Button onClick={() => setValidate(true)}>SUBMIT</Button>
      <div>
        Validating: {validate.toString()}
        <br />
        defaultValue: {args.defaultValue}
        <br />
        value: {value}
      </div>
    </Form>
  )
}

export const Input = Template.bind({});
Input.args = defaultArgs
