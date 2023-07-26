import React, { ChangeEvent } from 'react';
import { Form, Label } from 'semantic-ui-react';
import InputMask, { InputState } from "react-input-mask";
import type { MaskedUxProps } from '../types';

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

  function onChange(event: ChangeEvent<HTMLInputElement>) {
    if (props.uxChange)
      props.uxChange(event.currentTarget.value);
  }

  return (
    <Form.Field className={props.className}>
      <Label>{props.intlLabel}</Label>
      <InputMask name={props.name}
        mask="9999-99-99"
        defaultValue={props.value}
        value={props.value}
        beforeMaskedValueChange={beforeMaskedValueChange}
        alwaysShowMask
        onChange={onChange}
        readOnly={props.readOnly} />

    </Form.Field>
  );
}
