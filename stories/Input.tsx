import React from 'react';
import { Form, Label, Input as SemanticInput, StrictInputProps } from 'semantic-ui-react'
import "@the-coin/site-base/build/styles/semantic.less"

export interface InputProps extends StrictInputProps {
  label: string
}
export const Input: React.FC<InputProps> = (props) => {
  const { label, ...rest } = props;
  return (
    <Form>
      <Form.Field>
        <Label>{label}</Label>
        <SemanticInput {...rest} />
      </Form.Field>
    </Form>
  )
}
