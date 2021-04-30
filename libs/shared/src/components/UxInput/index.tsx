import React, { createRef, useState } from 'react';
import { Form, Label, Input, Popup } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';
import { Props as MyProps, UxOnChange } from './types';
import { LessVars } from "@thecointech/site-semantic-theme/variables";

type Props = Readonly<MyProps>;

export const UxInput = (props:Props) => {
  
  const [value, setValue] = useState("");
  const [showState, setShowState] = useState(false);

  const {
    intlLabel,
    uxChange,
    uxchangenew,
    forceValidate,
    footer,
    isValid,
    message,
    messageValues,
    tooltip,
    ...inputProps
  } = props;
  
  function onBlur(event: React.FocusEvent<HTMLInputElement>) {
    const { value } = event.currentTarget;
    setShowState(value.length > 0);
  }

  function onChange(event: UxOnChange) {
    uxChange(event);
    setValue(event.currentTarget.value);
    setShowState(true);
  }

    const errorTag = showState && (isValid === false);
    const successTag = showState && (isValid === true);
    const formClassName = successTag ? 'success' : undefined;
    const showMessage = showState && (message != undefined);
    const labelToPrint = intlLabel.hasOwnProperty("defaultMessage") ? <FormattedMessage {...intlLabel} /> : intlLabel;
    const tooltipData = tooltip;

    const contextRef = createRef<HTMLSpanElement>()

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
        content={message ? <FormattedMessage {...message} /> : undefined} 
        open={showMessage} style={errorTag ? styleError : styleSuccess } />
    );

    return(
      <Form.Field className={formClassName +" "+ inputProps.className} error={errorTag}>
        <Label>
          {labelToPrint}
        </Label>
        {messageElement}
        {inputElement}
        {footer}
        
      </Form.Field>
    );
}
