import React, { useState, useCallback } from "react";
import { UxInput } from "@the-coin/shared/components/UxInput";
import { MessageDescriptor } from "react-intl";
import messages from '../messages';
import { useAccountMap, AccountDict } from "@the-coin/shared/containers/AccountMap";


type Props = {
  disabled?: boolean;
  forceValidate?: boolean;
  setName: (name: MaybeString) => void;
}

const initialState = {
  isValid: undefined as boolean | undefined,
  message: undefined as MessageDescriptor | undefined,
  value: '',
}
type State = typeof initialState;

export const NameInput = (props: Props) => {

  const [state, setState] = useState(initialState);
  const accounts = useAccountMap();
  const onChange = useCallback((value: string) => {
    const newState = validateName(value, accounts);
    setState(newState);
    props.setName(newState.isValid
      ? newState.value
      : undefined)
  }, [setState, accounts])

  return (
    <UxInput
      uxChange={onChange}
      intlLabel={messages.labelName}
      isValid={state.isValid}
      message={state.message}
      placeholder="Any name you like"
      {...props}
    />
  );
}


// Validate our inputs
const validateName = (value: string, accounts: AccountDict) : State =>  {
  const validation =
    value.length === 0
      ? {
        isValid: false,
        message: messages.errorNameTooShort,
      }
      : accounts[value]
        ? {
          isValid: false,
          message: messages.errorNameDuplicate,
        }
        : {
          isValid: true,
          message: undefined,
        };

  return {
    value,
    ...validation,
  };
};
