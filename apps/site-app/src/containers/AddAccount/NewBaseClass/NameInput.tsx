
import React, { useState } from "react";
import { UxInput } from "@thecointech/shared/components/UxInput";
import { MessageDescriptor } from "react-intl";
import messages from '../messages';
import { useAccountStore, AccountState } from "@thecointech/shared/containers/AccountMap";
import { UxOnChange } from "@thecointech/shared/components/UxInput/types";


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
  const {accounts} = useAccountStore();
  ////////////////////////////////

  const onChange = (e:UxOnChange) => {
    const newState = validateName(e.currentTarget.value, accounts);
    setState(newState);
    props.setName(newState.isValid
      ? newState.value
      : undefined)
  }


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
const validateName = (value: string, accounts: AccountState[]) : State =>  {
  const validation =
    value.length === 0
      ? {
        isValid: false,
        message: messages.errorNameTooShort,
      }
      : accounts.find(account => account.name === value)
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
