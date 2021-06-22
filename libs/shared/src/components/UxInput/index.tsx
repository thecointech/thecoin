import React, { createRef, useState } from 'react';
import { Form, Label, Input, Popup } from 'semantic-ui-react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { Props as MyProps } from './types';
import { LessVars } from "@thecointech/site-semantic-theme/variables";

const translate = defineMessages({  
              placeholder: { defaultMessage:"This field is required",
                        description:"shared.uxinput.required.tooltip: Tooltip for the required uxinput"}});


type Props = Readonly<MyProps>;

export const UxInput = (props:Props) => {

  const [value, setValue] = useState("");
  const [showState, setShowState] = useState(false);

  const {
    intlLabel,
    uxChange,
    forceValidate,
    footer,
    isValid,
    isRequired,
    message,
    messageValues,
    tooltip,
    ...inputProps
  } = props;


  function onBlur(event: React.FocusEvent<HTMLInputElement>) {
    const { value } = event.currentTarget;
    setShowState(value.length > 0);
    if (isRequired && (value.length == 0)){
      setShowState(true);
    }
    if (isValid){
      setShowState(false);
    }
  }

  function onChange(event: React.FormEvent<HTMLInputElement>) {
    const { value } = event.currentTarget;
    props.uxChange(value);
    setValue(value);
  }


    const intl = useIntl();

    const errorTag = showState && (isValid === false);
    const successTag = showState && (isValid === true);
    const formClassName = successTag ? 'success' : undefined;
    const showMessage = showState && (message != undefined);
    const labelToPrint = intlLabel.hasOwnProperty("defaultMessage") ? <FormattedMessage {...intlLabel} /> : intlLabel;
    const tooltipRequired = (!intlLabel && !tooltip && isRequired) ? translate.placeholder: undefined;
    const tooltipData = tooltip ? intl.formatMessage(tooltip) : tooltipRequired;

    const contextRef = createRef<HTMLSpanElement>();

    const styleError = {
      color:  LessVars.errorColor,
      borderColor: LessVars.errorBorderColor,
    }

    const styleSuccess = {
      color:  LessVars.successColor,
      borderColor: LessVars.successBorderColor,
    }

    const inputElement = (
      <span ref={contextRef}>
        <Input
          onChange={onChange}
          onBlur={onBlur}
          value={value}
          {...inputProps}
          data-tooltip={tooltipData}
        />
      </span>
    );
    const messageElement = (
      <Popup
        context={contextRef}
        position='top right'
        content={message ? intl.formatMessage(message) : undefined}
        open={showMessage} style={errorTag ? styleError : styleSuccess } />
    );

    return(
      <Form.Field className={formClassName +" "+ inputProps.className} error={errorTag}>
        <Label>{labelToPrint}</Label>
        {messageElement}
        {inputElement}
        {footer}

      </Form.Field>
    );
}
