import React from 'react';
import { Form, Label } from 'semantic-ui-react';
import InputMask from "react-input-mask";
import { MaskedUxProps } from '../types';

export const UxCanadianPC = (props:MaskedUxProps) => {
    return (
      <Form.Field className={props.className}>
        <Label>{props.label}</Label>
          <InputMask name={props.name} 
                      mask="a9a 9a9"
                      alwaysShowMask 
                      onChange={props.onChange} 
                      readOnly={props.readOnly} />
        
      </Form.Field>
    );
}