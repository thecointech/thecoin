import React, { useState } from 'react';
import { StoryFn, Meta } from '@storybook/react-webpack5';
import { UxAddress } from '.';
import { Button, Form } from 'semantic-ui-react';
import { languageDecorator } from '../../../../internal/languageDecorator';

export default {
  title: 'shared/UX/Address',
  component: UxAddress,
    decorators: languageDecorator
} as Meta;

const defaultArgs = {
  defaultValue: "",
  intlLabel: "Address",
};

const makeIntl = (el: string, args: any) => ({ id: el, defaultMessage: args[el] })
const Template: StoryFn<typeof defaultArgs> = (args) => {
  const [value, setValue] = useState<MaybeString>("");
  const [validate, setValidate] = useState(false);

  return (
    <Form style={{paddingTop: 50}}>
      <UxAddress
        intlLabel={makeIntl("intlLabel", args)}

        defaultValue={args.defaultValue}
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

export const Address = Template.bind({});
Address.args = defaultArgs
