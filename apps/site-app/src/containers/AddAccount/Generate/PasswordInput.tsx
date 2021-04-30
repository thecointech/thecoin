import React, { useState, useCallback, FormEvent } from "react";
import { MessageDescriptor } from "react-intl";
import messages from '../messages';
import { UxScoredPassword } from "@thecointech/site-base/components/UxScoredPassword";

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

  ////////////////////////////////
  const onChange = useCallback((e: UxOnChange, score: number) => {
    const newState = validatePassword(e.currentTarget.value, score);
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
    intlLabel={messages.labelPassword}
    placeholder="At least moderate strength"
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
