import React, { useState } from 'react';
import { StoryFn, Meta } from '@storybook/react-webpack5';
import { UxInput as UxInput } from '.';
import { Button, Form } from 'semantic-ui-react';

export default {
  title: 'shared/UX/Input',
  component: UxInput,
} as Meta;

const defaultArgs = {
  validationDelay: 3000,
  defaultValue: "",
  validValue: "string match",
  placeholder: "placeholder",
  intlLabel: "Label",
  message: "Error Message: should match validValue",
  tooltip: "Input Tooltip",
};

const makeIntl = (el: string, args: any) => ({ id: el, defaultMessage: args[el] })
const Template: StoryFn<typeof defaultArgs> = (args) => {
  const [value, setValue] = useState<MaybeString>("");
  const [validate, setValidate] = useState(false);
  const [currently, setCurrently] = useState(false);

  const onValidate = async (val: string) => {
    setCurrently(true);
    await new Promise(resolve => setTimeout(resolve, args.validationDelay));
    setCurrently(false);
    return (val == args.validValue) ? null : makeIntl("message", args);
  }

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
        Currently: {currently.toString()}
        <br />
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
