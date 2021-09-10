import React from "react";
import { UxInput } from "@thecointech/shared/components/UX/Input";
import { defineMessages } from "react-intl";
import { AccountMap } from "@thecointech/shared/containers/AccountMap";
import { AccountState } from '@thecointech/account';

const translations = defineMessages({
  placeholder : {
      defaultMessage: 'Any name you like',
      description: 'app.addAccount.newbaseclass.nameinput.placeholder: Tooltip for the account name input'},
  tooltip : {
        defaultMessage: 'Your accounts name is only for your own reference',
        description: 'Describe account name for creation'},
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
  setName: (name: MaybeString) => void;
}

export const NameInput = (props: Props) => {

  const { setName, ...rest } = props;
  const accounts = AccountMap.useAsArray();
  return (
    <UxInput
      onValue={setName}
      onValidate={(value) => validateName(value, accounts)}
      intlLabel={translations.labelName}
      placeholder={translations.placeholder}
      tooltip={translations.tooltip}
      {...rest}
    />
  );
}


// Validate our inputs
const validateName = (value: string, accounts: AccountState[]) =>  {
  return value.length === 0
      ? translations.errorNameTooShort
      : accounts.find(account => account.name === value)
        ? translations.errorNameDuplicate
        : null;

};
