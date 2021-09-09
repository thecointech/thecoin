import React, { useState } from 'react';
import { Story, Meta } from '@storybook/react';
import { UxEmail } from '.';
import { Button, Form } from 'semantic-ui-react';

export default {
  title: 'shared/UX/Email',
  component: UxEmail,
} as Meta;


const Template: Story = () => {
  const [value, setValue] = useState<MaybeString>("");
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
