import React, { useCallback } from "react";
import { UxInput } from "@thecointech/shared/components/UX/Input";
import { defineMessages } from "react-intl";
import { AccountMap } from "@thecointech/redux-accounts";

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
  const accountNames = accounts.map(a => a.name);

  const onValidate = useCallback(
    (value: string) => validateName(value, accountNames),
    accountNames
  );
  return (
    <UxInput
      onValue={setName}
      onValidate={onValidate}
      intlLabel={translations.labelName}
      placeholder={translations.placeholder}
      tooltip={translations.tooltip}
      {...rest}
    />
  );
}


// Validate our inputs
const validateName = (value: string, accountNames: string[]) =>  {
  return value.length === 0
      ? translations.errorNameTooShort
      : accountNames.find(accountName => accountName === value)
        ? translations.errorNameDuplicate
        : null;

};
