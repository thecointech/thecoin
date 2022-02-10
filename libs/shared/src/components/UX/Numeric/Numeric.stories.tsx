import React, { useState } from 'react';
import { Story, Meta } from '@storybook/react';
import { UxNumeric } from '.';
import { Button, Form } from 'semantic-ui-react';
import { action } from '@storybook/addon-actions';

export default {
  title: 'shared/UX/Numeric',
  args: {
    min: 0,
    max: 100,
  }
} as Meta;

const makeIntl = (el: string) => ({ id: el, defaultMessage: el })
const onValue = action("on-value");
export const Numeric: Story = (args) => {
  const [validate, setValidate] = useState(false);
  const onValidate = (n: number|undefined) => {
    return n && n % 2 ? makeIntl(`${n} is not even`) : null;
  }
  return (
    <Form style={{ paddingTop: 50 }}>
      <UxNumeric
        {...args}
        tooltip={makeIntl("Must be an even number")}
        placeholder={makeIntl("Enter any number")}
        intlLabel={makeIntl("Yergle blergle")}
        onValue={onValue}
        onValidate={onValidate}
        forceValidate={validate}
      />
      <Button onClick={() => setValidate(true)}>SUBMIT</Button>
      <div>
        Validating: {validate.toString()}
      </div>
    </Form>
  )
}
