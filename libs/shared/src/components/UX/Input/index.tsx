import React, { createRef, useEffect, useState } from 'react';
import { Form, Label, Input, Popup } from 'semantic-ui-react';
import { FormattedMessage, MessageDescriptor, useIntl } from 'react-intl';
import { BaseProps } from '../types';
import { LessVars } from "@thecointech/site-semantic-theme/variables";

const isMessage = (messageOrComponent: BaseProps["intlLabel"]): messageOrComponent is MessageDescriptor =>
  messageOrComponent.hasOwnProperty("defaultMessage")

export const UxInput = (props: BaseProps) => {

  const {
    onValue,
    onValidate,

    defaultValue,
    forceValidate,

    placeholder,
    type
  } = props;

  const [value, setValue] = useState(defaultValue ?? "");
  const [showState, setShowState] = useState(false);
  const [errorMessage, setErrorMessage] = useState<MessageDescriptor | null>(null);

  const onBlur = () => {
    setShowState(true);
  }

  const localChange = (value: string) => {
    setValue(value);
    const validateResult = onValidate(value, props.name)
    setErrorMessage(validateResult);
    onValue(validateResult ? undefined : value, props.name);
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

  const isValid = !errorMessage;
  const doShowState = forceValidate || showState;

  const intl = useIntl();
  const label = isMessage(props.intlLabel) ? <FormattedMessage {...props.intlLabel} /> : props.intlLabel;
  const tooltip = intl.formatMessage(props.tooltip, props.tooltip.values);
  const formClassName = doShowState
    ? isValid ? 'success' : 'error'
    : ''

  const contextRef = createRef<HTMLSpanElement>();
  const styleError = {
    color: LessVars.errorColor,
    borderColor: LessVars.errorBorderColor,
  }

  return (
    <Form.Field className={`${formClassName} ${props.className}`} >
      <Label>{label}</Label>
      <Popup
        context={contextRef}
        position='top right'
        content={errorMessage ? <FormattedMessage {...errorMessage} /> : undefined}
        open={doShowState && !isValid}
        style={styleError}
      />
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
    </Form.Field>
  );
}
