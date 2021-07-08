import React, { useState, useCallback } from "react";
import { UxInput } from "@thecointech/shared/components/UxInput";
import { GetReferrersApi } from "api";
import { IsValidShortCode } from "@thecointech/utilities";
import { defineMessages, FormattedMessage, MessageDescriptor, useIntl } from "react-intl";

const translations = defineMessages({
  placeholder : {
      defaultMessage: '6 letters or numbers',
      description: 'app.addaccount.newbaseclass.referralinput.placeholder: Tooltip for the referral input'},
  error : {
      defaultMessage: 'Registering this account failed. Please contact support@thecoin.io6 letters or numbers',
      description: 'app.addaccount.newbaseclass.referralinput.error: Error for the referral input'},
  labelReferrer : {
      defaultMessage: 'Referral Code',
      description: 'app.addaccount.newbaseclass.referralinput.labelReferrer'},
  errorReferrerNumChars : {
      defaultMessage: 'A referrer ID should be 6 characters long.',
      description: 'app.addaccount.newbaseclass.referralinput.errorReferrerNumChars'},
  errorReferrerInvalidCharacters : {
      defaultMessage: 'A referrer ID should only contain alpha-numeric characters.',
      description: 'app.addaccount.newbaseclass.referralinput.errorReferrerInvalidCharacters'},
  errorReferrerUnknown : {
      defaultMessage: 'The entered referrer ID is not recognized',
      description: 'app.addaccount.newbaseclass.referralinput.errorReferrerUnknown'}
});
            
type Props = {
  disabled?: boolean,
  forceValidate?: boolean,
  setReferral: (value: MaybeString) => void;
}

const initialState = {
  isValid: undefined as boolean | undefined,
  message: undefined as MessageDescriptor | undefined,
  value: '',
}

type State = typeof initialState;

export const ReferralInput = (props: Props) => {

  const intl = useIntl();
  const [state, setState] = useState(initialState);
  const { setReferral, ...rest} = props;

  const onChange = useCallback(async (value: string) => {
    const newState = await validateReferral(value);
    setState(newState);
    setReferral(newState.isValid
      ? newState.value
      : undefined);

  }, [setState, setReferral]);

  return (
    <UxInput
      uxChange={onChange}
      intlLabel={translations.labelReferrer}
      isValid={state.isValid}
      message={state.message}
      placeholder={intl.formatMessage(translations.placeholder)}
      {...rest}
    />
  );
}

export const registerReferral = async (address: string, code: string) => {
  // Register this account on the server
  const api = GetReferrersApi();
  var isRegistered = await api.referralCreate({
    address,
    code,
  });

  if (!isRegistered.data?.success) {
    alert(<FormattedMessage {...translations.error} />);
    return false;
  }
  return true;
}

const isLegalReferral = async (code: string) => {

  const api = GetReferrersApi()
  // Weird issue: typescript not recognizing the return type
  const isValid = await api.referrerValid(code);
  return isValid.data?.success;
}

const validateReferral = async (value: string) : Promise<State> => {
  const validation =
    value.length !== 6
      ? {
          isValid: false,
          message: translations.errorReferrerNumChars,
        }
      : !IsValidShortCode(value)
        ? {
            isValid: false,
            message: translations.errorReferrerInvalidCharacters,
          }
        : !(await isLegalReferral(value))
          ? {
              isValid: false,
              message: translations.errorReferrerUnknown,
            }
          : {
              isValid: true,
              message: undefined,
            };
  return {
    value: value,
    ...validation,
  };
};
