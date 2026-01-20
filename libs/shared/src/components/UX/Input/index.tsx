import React, { useEffect, useState, useRef } from 'react';
import { Form, Label, Input, Popup } from 'semantic-ui-react';
import { FormattedMessage, MessageDescriptor, useIntl } from 'react-intl';
import { BaseProps } from '../types';
import { LessVars } from "@thecointech/site-semantic-theme/variables";
import { MessageWithValues } from '../../../types';

export const UxInput = (props: BaseProps) => {

  const {
    onValue,
    onValidate,

    defaultValue,
    resetToDefault,
    forceValidate,

    transformDisplayValue,

    placeholder,
    tooltip,
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
  }, [forceValidate])

  // Ensure that if the if the validation function
  // is updated, we revalidate the current value
  useEffect(() => {
    if (value && value != defaultValue) {
      localChange(value)
    }
  }, [onValidate])

  // Reset to default value either if requested, or if defaultValue changes
  useEffect(() => {
    localChange(defaultValue ?? "")
      .then(() => setErrorMessage(null))
      .catch(() => setErrorMessage(null))
  }, [defaultValue, resetToDefault])

  const isValid = !errorMessage;
  const doShowState = forceValidate || showState;
  const showingError = doShowState && !isValid;

  const intl = useIntl();
  const tt = showingError || !tooltip
    ? undefined
    : intl.formatMessage(tooltip, tooltip.values);
  const formClassName = doShowState
    ? isValid ? 'success' : 'error'
    : ''

  const contextRef = useRef<HTMLSpanElement>(null);
  const styleError = {
    color: LessVars.errorColor.toString(),
    borderColor: LessVars.errorBorderColor.toString(),
  }

  const transformV = transformDisplayValue?.toValue ?? (v => v);
  const transformD = transformDisplayValue?.toDisplay ?? (v => v);

  return (
    <Form.Field className={`${formClassName} ${props.className}`} >
      <MaybeLabel label={props.intlLabel} />
      <Popup
        context={contextRef.current ?? undefined}
        position='top right'
        content={errorMessage ? <FormattedMessage {...errorMessage} /> : undefined}
        open={showingError}
        style={styleError}
      />
      <span ref={contextRef}>
        <Input
          onChange={(_, { value }) => localChange(transformV(value))}
          onBlur={onBlur}
          value={transformD(value)}
          placeholder={placeholder ? intl.formatMessage(placeholder) : ''}
          type={type}
          data-tooltip={tt}
          readOnly={props.readOnly}
        />
      </span>
    </Form.Field>
  );
}

type LabelProps =  BaseProps["intlLabel"];
const isMessage = (messageOrComponent: LabelProps): messageOrComponent is MessageDescriptor =>
  messageOrComponent?.hasOwnProperty("defaultMessage") ?? false
const MaybeLabel = ({label}: {label?: LabelProps}) =>
  label
    ? <Label>
        {isMessage(label)
          ? <FormattedMessage {...label} />
          : label
        }
      </Label>
    : null
