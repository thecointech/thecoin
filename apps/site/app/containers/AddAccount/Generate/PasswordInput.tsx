import React, { useState, useCallback } from "react";
import { MessageDescriptor } from "react-intl";
import messages from '../messages';
import { useAccounts } from "@the-coin/shared/containers/Account/selector";
import { UxScoredPassword } from "components/UxScoredPassword";


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
  const accounts = useAccounts();
  const onChange = useCallback((value: string, score: number) => {
    const newState = validatePassword(value, score);
    setState(newState);
    props.setPassword(newState.isValid 
      ? newState.value
      : undefined);

    return newState.isValid ?? false;
  }, [setState, accounts])

  return (
    <UxScoredPassword
    uxChange={onChange}
    intlLabel={messages.labelPassword}
    placeholder="At least moderate strength"
    {...props}
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