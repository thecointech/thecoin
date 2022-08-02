import React, { ChangeEvent } from 'react';
import { Form, Label } from 'semantic-ui-react';
import InputMask from "react-input-mask";
import type { MaskedUxProps } from "../types";



export const UxPhone = (props:MaskedUxProps) => {

  function onChange(event: ChangeEvent<HTMLInputElement>) {
    if (props.uxChange)
      props.uxChange(event.currentTarget.value);
  }

    return (
      <Form.Field className={props.className}>
        <Label>{props.intlLabel}</Label>
          <InputMask name={props.name}
                      mask="999 999 9999"
                      defaultValue={props.value}
                      alwaysShowMask
                      onChange={onChange}
                      readOnly={props.readOnly} />

      </Form.Field>
    );
}
