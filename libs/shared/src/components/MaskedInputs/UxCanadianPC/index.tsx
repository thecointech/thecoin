import React, { ChangeEvent } from 'react';
import { Form, Label } from 'semantic-ui-react';
import InputMask from "react-input-mask";
import type { MaskedUxProps } from '../types';

export const UxCanadianPC = (props:MaskedUxProps) => {

  function onChange(event: ChangeEvent<HTMLInputElement>) {
    if (props.uxChange)
      props.uxChange(event.currentTarget.value);
  }

    return (
      <Form.Field className={props.className}>
        <Label>{props.label}</Label>
          <InputMask name={props.name}
                      mask="a9a 9a9"
                      alwaysShowMask
                      onChange={onChange}
                      readOnly={props.readOnly} />

      </Form.Field>
    );
}
