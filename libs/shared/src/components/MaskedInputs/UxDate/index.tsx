import React from 'react';
import { Form, Label } from 'semantic-ui-react';
import InputMask, { InputState } from "react-input-mask";
import { MaskedUxProps } from '../types';

function beforeMaskedValueChange(state: InputState) {
  let { value } = state;
  var dateInfos = value.split("-");
  if (parseInt(dateInfos[1]) > 12) {
    dateInfos[1] = "12";
  }
  if (parseInt(dateInfos[2]) > 31) {
    dateInfos[2] = "31";
  }
  value = dateInfos[0]+"-"+dateInfos[1]+"-"+dateInfos[2];

  return {
    ...state,
    value
  };
}


export const UxDate = (props:MaskedUxProps) => {
    return (
      <Form.Field className={props.className}>
        <Label>{props.label}</Label>
          <InputMask name={props.name} 
                      mask="9999-99-99"
                      beforeMaskedValueChange={beforeMaskedValueChange}
                      alwaysShowMask 
                      onChange={props.onChange} 
                      readOnly={props.readOnly} />
        
      </Form.Field>
    );
}