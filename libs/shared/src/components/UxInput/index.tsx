import React, { createRef, useState } from 'react';
import { Form, Label, Input, Popup } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';
import { Props as MyProps } from './types';
import { LessVars } from "@thecointech/site-semantic-theme/variables";

type Props = Readonly<MyProps>;
export const initialState = {
  value: '',
  showState: false,
};


export const UxInput = (props:Props) => {
  
  const [value, setValue] = useState("");
  const [showState, setShowState] = useState(false);
  const {
    intlLabel,
    label,
    uxChange,
    forceValidate,
    footer,
    isValid,
    message,
    messageValues,
    tooltip,
    ...inputProps
  } = props;
  
  //
  // Ensure that if we recieve the forceValidate prop, we validate
  // our current value and show the result (regardless of state)
  //function getDerivedStateFromProps(nextProps: Props, prevState: State) {
  //  if (nextProps.forceValidate && !prevState.showState) {
  //    nextProps.uxChange(prevState.value);
  //    return {
  //      showState: true,
  //    };
  //  }
  //  return null;
  //}

  function onBlur(event: React.FocusEvent<HTMLInputElement>) {
    const { value } = event.currentTarget;
    setShowState(value.length > 0);
  }

  function onChange(event: React.FormEvent<HTMLInputElement>) {
    const { value } = event.currentTarget;
    props.uxChange(value);
    setValue(value);
  }

    const errorTag = showState && (isValid === false);
    const successTag = showState && (isValid === true);
    const formClassName = successTag ? 'success' : undefined;
    const showMessage = showState && (message != undefined);

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
      <Form.Field className={formClassName} error={errorTag}>
        <Label>
          <FormattedMessage {...props.intlLabel} /> {props.label}
        </Label>
        {messageElement}
        {inputElement}
        {footer}
        
      </Form.Field>
    );
}
