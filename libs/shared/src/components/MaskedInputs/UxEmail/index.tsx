import React from 'react';
import { Form, Label } from 'semantic-ui-react';
import InputMask from "react-input-mask";
import { MaskedUxProps } from "../types";

const firstLetter = /(?!.*[DFIOQU])[A-VXY]/i;
const letter = /(?!.*[DFIOQU])[A-Z]/i;
const digit = /[0-9]/;
const mask = [firstLetter, digit, letter, " ", digit, letter, digit];

export const UxCanadianPC = (props:MaskedUxProps) => {
    return (
      <Form.Field className={props.className}>
        <Label>{props.label}</Label>
          <InputMask name={props.name} 
                      mask={mask}
                      alwaysShowMask 
                      onChange={props.onChange} 
                      readOnly={props.readOnly} />
        
      </Form.Field>
    );
}