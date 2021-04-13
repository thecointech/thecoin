import React, { ChangeEvent } from 'react';
import { Form, InputOnChangeData, Label } from 'semantic-ui-react';
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
  onChange?: (event: ChangeEvent<HTMLInputElement>, data: InputOnChangeData) => void,
  name: string, 
  readOnly?: boolean
}

export const UxPhone = (props:Props) => {

    return (
      <Form.Field className={props.className}>
        <Label>{props.label}</Label>
          <InputMask name={props.name} 
                      mask="+1 999 999 9999" 
                      alwaysShowMask 
                      onChange={props.onChange} 
                      readOnly={props.readOnly} />
        
      </Form.Field>
    );
}