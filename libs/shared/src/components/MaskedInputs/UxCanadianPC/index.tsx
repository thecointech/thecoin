import React, { ChangeEventHandler } from 'react';
import { Form, Label } from 'semantic-ui-react';
import InputMask from "react-input-mask";
import { AccountDetails } from 'containers/AccountDetails/types';

export type Props ={
  label: JSX.Element,
  value: {  countryCode?: string | undefined;
            countryCode2?: string | undefined;
            phoneNumber?: string | undefined;
            number?: string | undefined; } | undefined,
  className?: string,
  details?: AccountDetails,
  onChange?: ChangeEventHandler<HTMLInputElement> | undefined,
  name: string, 
  readOnly?: boolean
}

const firstLetter = /(?!.*[DFIOQU])[A-VXY]/i;
const letter = /(?!.*[DFIOQU])[A-Z]/i;
const digit = /[0-9]/;
const mask = [firstLetter, digit, letter, " ", digit, letter, digit];

export const UxCanadianPC = (props:Props) => {
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