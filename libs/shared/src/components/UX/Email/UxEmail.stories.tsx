import React, { useState } from 'react'
import { StoryFn, Meta } from '@storybook/react-webpack5';
import { UxEmail } from '.';
import { Button, Form } from 'semantic-ui-react';
import { languageDecorator } from '../../../../internal/languageDecorator';

export default {
  title: 'shared/UX/Email',
  component: UxEmail,
  decorators: languageDecorator
} as Meta;


const Template: StoryFn = () => {
  const [value, setValue] = useState<string>("");
  const [validate, setValidate] = useState(false);

  return (
    <Form style={{paddingTop: 50}}>
      <UxEmail
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

export const Email = Template.bind({});
Email.args = {}
