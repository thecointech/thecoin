import React, { createRef, useEffect, useState } from 'react';
import { Form, Label, Input, Popup } from 'semantic-ui-react';
import { FormattedMessage, MessageDescriptor, useIntl } from 'react-intl';
import { BaseProps } from '../types';
import { LessVars } from "@thecointech/site-semantic-theme/variables";
import { MessageWithValues } from '../../../types';

const isMessage = (messageOrComponent: BaseProps["intlLabel"]): messageOrComponent is MessageDescriptor =>
  messageOrComponent.hasOwnProperty("defaultMessage")

export const UxInput = (props: BaseProps) => {

  const {
    onValue,
    onValidate,

    defaultValue,
    resetToDefault,
    forceValidate,

    placeholder,
    type
  } = props;

  const [value, setValue] = useState(defaultValue ?? "");
  const [showState, setShowState] = useState(false);
  const [errorMessage, setErrorMessage] = useState<MessageWithValues | null>(null);

  const onBlur = () => {
    setShowState(true);
  }

  const localChange = async (value: string) => {
    setValue(value);
    const validateResult = await onValidate(value, props.name)
    setErrorMessage(validateResult);
    onValue(validateResult ? undefined : value, props.name);
  }

  // If we must force-validate, but we not already
  // run, then check the validation
  useEffect(() => {
    if (!forceValidate) {
      setErrorMessage(null);
    }
    else {
      localChange(value);
    }
  }, [forceValidate, onValidate])

  // Reset to default value either if requested, or if defaultValue changes
  useEffect(() => {
    setValue(defaultValue ?? "");
    onValue(defaultValue);
  }, [defaultValue, resetToDefault])

  const isValid = !errorMessage;
  const doShowState = forceValidate || showState;
  const showingError = doShowState && !isValid;

  const intl = useIntl();
  const label = isMessage(props.intlLabel) ? <FormattedMessage {...props.intlLabel} /> : props.intlLabel;
  const tooltip = showingError
    ? undefined
    : intl.formatMessage(props.tooltip, props.tooltip.values);
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
        open={showingError}
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
          readOnly={props.readOnly}
        />
      </span>
    </Form.Field>
  );
}
