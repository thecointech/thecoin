import React, { useState } from "react";
import { UxInput } from "@thecointech/shared/components/UxInput";
import { defineMessages, MessageDescriptor, useIntl } from "react-intl";
import { AccountMap } from "@thecointech/shared/containers/AccountMap";
import { AccountState } from '@thecointech/account';

const translations = defineMessages({
  placeholder : {
      defaultMessage: 'Any name you like',
      description: 'app.addAccount.newbaseclass.nameinput.placeholder: Tooltip for the account name input'},
  labelName : {
      defaultMessage: 'Account Name',
      description: 'app.addAccount.newbaseclass.labelName'},
  errorNameTooShort : {
      defaultMessage: 'An account must have a name.',
      description: 'app.addAccount.newbaseclass.errorNameTooShort'},
  errorNameDuplicate : {
      defaultMessage: 'An account with this name already exists here.',
      description: 'app.addAccount.newbaseclass.errorNameDuplicate'}
});

type Props = {
  disabled?: boolean;
  forceValidate?: boolean;
  isRequired?: boolean;
  setName: (name: MaybeString) => void;
}

const initialState = {
  isValid: undefined as boolean | undefined,
  message: undefined as MessageDescriptor | undefined,
  value: '',
}
type State = typeof initialState;

export const NameInput = (props: Props) => {

  const intl = useIntl();
  const [state, setState] = useState(initialState);
  const { setName, ...rest } = props;
  const accounts = AccountMap.useAsArray();

  const onChange = (value: string) => {
    const newState = validateName(value, accounts);
    setState(newState);
    props.setName(newState.isValid
      ? newState.value
      : undefined)
  }


  return (
    <UxInput
      uxChange={onChange}
      intlLabel={translations.labelName}
      isValid={state.isValid}
      isRequired={props.isRequired}
      message={state.message}
      placeholder={intl.formatMessage(translations.placeholder)}
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
        message: translations.errorNameTooShort,
      }
      : accounts.find(account => account.name === value)
        ? {
          isValid: false,
          message: translations.errorNameDuplicate,
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
