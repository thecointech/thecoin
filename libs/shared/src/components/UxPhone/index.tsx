import React from 'react';
import { Form, Label } from 'semantic-ui-react';
import InputMask from "react-input-mask";
import { FormattedMessage } from 'react-intl';

export const UxPhone = () => {

    return (
      <Form.Field>
        <Label>
          <FormattedMessage />
          <InputMask mask="+1\9999 9999" maskChar="_" />
        </Label>
      </Form.Field>
    );
}