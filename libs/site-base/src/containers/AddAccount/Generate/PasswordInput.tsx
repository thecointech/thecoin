import React, { useState, useCallback } from "react";
import { defineMessages, MessageDescriptor, useIntl } from "react-intl";
import { UxScoredPassword } from "../../../components/UxScoredPassword";

const translations = defineMessages({
  labelPassword : {
      defaultMessage: 'Password',
      description: 'app.addAccount.generate.labelPassword'},
  labelPasswordAtLeast : {
      defaultMessage: 'At least moderate strength',
      description: 'app.addAccount.generate.labelPasswordAtLeast'}
});

type Props = {
  disabled?: boolean;
  forceValidate?: boolean;
  setPassword: (name: MaybeString) => void;
}

const initialState = {
  isValid: undefined as boolean | undefined,
  message: undefined as MessageDescriptor | undefined,
  value: '',
}
type State = typeof initialState;

export const PasswordInput = (props: Props) => {

  const [state, setState] = useState(initialState);
  const { setPassword, ...rest } = props;
  const intl = useIntl();
  ////////////////////////////////
  const onChange = useCallback((value: string, score: number) => {
    const newState = validatePassword(value, score);
    setState(newState);
    setPassword(newState.isValid
      ? newState.value
      : undefined);

    return newState.isValid ?? false;
  }, [setState, setPassword])

  ////////////////////////////////

  return (
    <UxScoredPassword
    uxChange={onChange}
    intlLabel={translations.labelPassword}
    placeholder={intl.formatMessage(translations.labelPasswordAtLeast)}
    {...rest}
    {...state}
  />
  );
}

const validatePassword = (value: string, score: number): State => {
  const isValid = score > 2;
  return {
    value,
    isValid,
    message: undefined, // TODO
  };
};
