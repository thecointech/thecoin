import React, { useState } from 'react';
import { StoryFn, Meta } from '@storybook/react-webpack5';
import { UxScoredPassword } from '.';
import { Button, Form } from 'semantic-ui-react';
import { languageDecorator } from '../../../../internal/languageDecorator';

export default {
  title: 'shared/UX/ScoredPassword',
  component: UxScoredPassword,
  decorators: languageDecorator
} as Meta;

const Template: StoryFn = () => {
  const [value, setValue] = useState<MaybeString>("");
  const [validate, setValidate] = useState(false);

  return (
    <Form style={{paddingTop: 50, width: 300, margin: "auto"}}>
      <UxScoredPassword
        onValue={setValue}
        forceValidate={validate}
      />
      <Button onClick={() => setValidate(true)}>SUBMIT</Button>
      <div>
        Validating: {validate.toString()}
        <br />
        value: {value}
      </div>
    </Form>
  )
}

export const ScoredPassword = Template.bind({});
ScoredPassword.args = {}
