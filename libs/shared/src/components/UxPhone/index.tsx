import React, { ChangeEvent, MouseEventHandler } from 'react';
import { Form, Label } from 'semantic-ui-react';
import InputMask from "react-input-mask";
import { AccountDetails } from 'containers/AccountDetails/types';

export type Props ={
  label: JSX.Element,
  className?: string,
  details?: AccountDetails,
  onChange?: (event: ChangeEvent<HTMLInputElement>) => MouseEventHandler<HTMLSpanElement> | undefined,
  name?: string, 
  readOnly?: boolean
}

export const UxPhone = (props:Props) => {

    return (
      <Form.Field className={props.className}>
        <Label>
          {props.label}
          <InputMask mask="+1 999 999 9999" maskChar="_" alwaysShowMask onChange={props.onChange} />
        </Label>
      </Form.Field>
    );
}