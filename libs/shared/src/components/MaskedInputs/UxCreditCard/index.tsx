import React, { ChangeEvent } from 'react';
import { Form, Label } from 'semantic-ui-react';
import InputMask from "react-input-mask";
import { MaskedUxProps } from "../types";

export const UxCreditCard = (props:MaskedUxProps) => {
    return (
      <Form.Field className={props.className}>
        <Label>{props.label}</Label>
          <InputMask name={props.name} 
                      mask="9999-9999-9999-9999"
                      alwaysShowMask 
                      onChange={(_event: ChangeEvent<HTMLInputElement>) => props.onChange} 
                      readOnly={props.readOnly} />
        
      </Form.Field>
    );
}