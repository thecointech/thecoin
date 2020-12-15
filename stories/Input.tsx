import React from 'react';
import { Header, Form, Label, Input as SemanticInput, StrictInputProps } from 'semantic-ui-react'
import "@the-coin/site-base/build/styles/semantic.less"

export interface InputProps extends StrictInputProps {
  label: string
}
export const Input: React.FC<InputProps> = (props) => {
  const { label, ...rest } = props;
  return (
    <>
      <Header as="H5">In Form</Header>
      <Form>
        <Form.Field>
          <Label>{label}</Label>
          <SemanticInput {...rest} />
        </Form.Field>
      </Form>
      <br />
      <hr />
      <Header as="H5">Raw</Header>
      <div>
        <Label>{label}</Label><br />
        <SemanticInput {...rest} />
      </div>
    </>
  )
}
