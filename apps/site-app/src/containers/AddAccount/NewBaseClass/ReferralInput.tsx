import React, { useState, useCallback } from "react";
import { UxInput } from "@thecointech/shared/components/UxInput";
import messages from '../messages';
import { GetReferrersApi } from "api";
import { IsValidReferrerId } from "@thecointech/utilities";
import { FormattedMessage, MessageDescriptor, useIntl } from "react-intl";
import { UxOnChange } from "@thecointech/shared/components/UxInput/types";


const placeholder = { id:"app.addaccount.newbaseclass.referralinput.placeholder",
                        defaultMessage:"6 letters or numbers",
                        description:"Tooltip for the referral input"};
const error = { id:"app.addaccount.newbaseclass.referralinput.error",
                        defaultMessage:"Registering this account failed. Please contact support@thecoin.io6 letters or numbers",
                        description:"Error for the referral input"};

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

  const onChange = useCallback(async (e: UxOnChange) => {
    const newState = await validateReferral(e.value);
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
      placeholder={intl.formatMessage(placeholder)}
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
    alert(<FormattedMessage {...error} />);
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
