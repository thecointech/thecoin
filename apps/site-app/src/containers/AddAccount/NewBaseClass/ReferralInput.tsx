import React, { useState, useCallback } from "react";
import { UxInput } from "@thecointech/shared/components/UxInput";
import messages from '../messages';
import { GetReferrersApi } from "api";
import { IsValidReferrerId } from "@thecointech/utilities/";
import { MessageDescriptor } from "react-intl";


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

  const [state, setState] = useState(initialState);
  const { setReferral, ...rest} = props;

  const onChange = useCallback(async (e: React.FormEvent<HTMLInputElement>) => {
    const newState = await validateReferral(e.currentTarget.value);
    setState(newState);
    setReferral(newState.isValid
      ? newState.value
      : undefined);

  }, [setState, setReferral]);

  return (
    <UxInput
      uxChange={onChange}
      intlLabel={messages.labelReferrer}
      isValid={state.isValid}
      message={state.message}
      placeholder="6 letters or numbers"
      {...rest}
    />
  );
}

export const registerReferral = async (address: string, code: string) => {
  // Register this account on the server
  const api = GetReferrersApi();
  var isRegistered = await api.referralCreate({
    newAccount: address,
    referrerId: code,
  });

  if (!isRegistered.data?.success) {
    alert(
      'Registering this account failed. Please contact support@thecoin.io',
    );
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
          message: messages.errorReferrerNumChars,
        }
      : !IsValidReferrerId(value)
        ? {
            isValid: false,
            message: messages.errorReferrerInvalidCharacters,
          }
        : !(await isLegalReferral(value))
          ? {
              isValid: false,
              message: messages.errorReferrerUnknown,
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
