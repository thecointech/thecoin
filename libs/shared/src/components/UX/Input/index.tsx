import React, { createRef, useEffect, useState } from 'react';
import { Form, Label, Input, Popup } from 'semantic-ui-react';
import { FormattedMessage, MessageDescriptor, useIntl } from 'react-intl';
import { Props } from '../types';
import { LessVars } from "@thecointech/site-semantic-theme/variables";

const isMessage = (messageOrComponent: Props["intlLabel"]): messageOrComponent is MessageDescriptor =>
  messageOrComponent.hasOwnProperty("defaultMessage")

export const UxInput = (props: Props) => {

  const {
    onValue,
    onValidate,

    defaultValue,
    forceValidate,
    footer,

    placeholder,
    type
  } = props;

  const [value, setValue] = useState(defaultValue ?? "");
  const [showState, setShowState] = useState(false);
  const [message, setMessage] = useState<MessageDescriptor | null>(null);

  const onBlur = () => {
    setShowState(true);
  }

  const localChange = (value: string) => {
    setValue(value);
    const errorMessage = onValidate(value, props.name)
    setMessage(errorMessage);
    onValue(errorMessage ? undefined : value, props.name);
  }

  // If we must force-validate, but we not already
  // run, then check the validation
  useEffect(() => {
    localChange(value);
  }, [forceValidate])

  // if defaultValue changes, then update our value to reflect that
  useEffect(() => {
    setValue(defaultValue ?? "");
  }, [defaultValue])

  const isValid = !message;
  const doShowState = forceValidate || showState;

  const intl = useIntl();
  const label = isMessage(props.intlLabel) ? <FormattedMessage {...props.intlLabel} /> : props.intlLabel;
  const tooltip = intl.formatMessage(props.tooltip);
  const formClassName = doShowState
    ? isValid ? 'success' : 'error'
    : ''

  const contextRef = createRef<HTMLSpanElement>();
  const styleError = {
    color: LessVars.errorColor,
    borderColor: LessVars.errorBorderColor,
  }

  const inputElement = (
    <span ref={contextRef}>
      <Input
        onChange={(_, { value }) => localChange(value)}
        onBlur={onBlur}
        value={value}
        placeholder={intl.formatMessage(placeholder)}
        type={type}
        data-tooltip={tooltip}
      />
    </span>
  );
  const messageElement = (
    <Popup
      context={contextRef}
      position='top right'
      content={message ? intl.formatMessage(message) : undefined}
      open={doShowState && !isValid}
      style={styleError} />
  );

  return (
    <Form.Field className={`${formClassName} ${props.className}`} >
      <Label>{label}</Label>
      {messageElement}
      {inputElement}
      {footer}
    </Form.Field>
  );
}
