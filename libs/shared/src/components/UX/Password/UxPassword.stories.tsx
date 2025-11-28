import React, { useState } from 'react';
import { StoryFn, Meta } from '@storybook/react-webpack5';
import { UxPassword } from '.';
import { Button, Form } from 'semantic-ui-react';
import { languageDecorator } from '../../../../internal/languageDecorator';

export default {
  title: 'shared/UX/Password',
  component: UxPassword,
  decorators: languageDecorator
} as Meta;

const defaultArgs = {
  defaultValue: "",
  intlLabel: "Password",
  tooltip: "At least medium complexity",
  placeholder: "Enter your password"
};

const makeIntl = (el: string, args: any) => ({ id: el, defaultMessage: args[el] })
const Template: StoryFn<typeof defaultArgs> = (args) => {
  const [value, setValue] = useState<MaybeString>("");
  const [validate, setValidate] = useState(false);

  return (
    <Form style={{paddingTop: 50}}>
      <UxPassword
        intlLabel={makeIntl("intlLabel", args)}

        tooltip={makeIntl("tooltip", args)}
        placeholder={makeIntl("placeholder", args)}
        onValue={setValue}
        forceValidate={validate}
      />
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

export const Password = Template.bind({});
Password.args = defaultArgs
