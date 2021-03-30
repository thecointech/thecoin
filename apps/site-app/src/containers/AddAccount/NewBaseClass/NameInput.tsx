import React, { useState, useCallback } from "react";
import { UxInput } from "@thecointech/shared/components/UxInput";
import { MessageDescriptor } from "react-intl";
import messages from '../messages';
import { useAccountMap, AccountDict } from "@thecointech/shared/containers/AccountMap";


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
  const { setName, ...rest } = props;

  ////////////////////////////////
  const accounts = useAccountMap();
  const onChange = useCallback((value: string) => {
    const newState = validateName(value, accounts);
    setState(newState);
    props.setName(newState.isValid
      ? newState.value
      : undefined)
  }, [setState, accounts, setName])
  ////////////////////////////////


  return (
    <UxInput
      uxChange={onChange}
      intlLabel={messages.labelName}
      isValid={state.isValid}
      message={state.message}
      placeholder="Any name you like"
      {...rest}
    />
  );
}


// Validate our inputs
const validateName = (value: string, accounts: AccountDict) : State =>  {
  const allAccounts = Object.values(accounts);
  const validation =
    value.length === 0
      ? {
        isValid: false,
        message: messages.errorNameTooShort,
      }
      : allAccounts.find(account => account.name === value)
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
