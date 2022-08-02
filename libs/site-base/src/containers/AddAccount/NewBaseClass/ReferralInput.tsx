import React from "react";
import { UxInput } from "@thecointech/shared/components/UX/Input";
import { GetReferrersApi } from "@thecointech/apis/broker";
import { IsValidShortCode } from "@thecointech/utilities";
import { defineMessages, FormattedMessage } from "react-intl";
import styles from './styles.module.less';

const translations = defineMessages({
  placeholder : {
      defaultMessage: '6 letters or numbers',
      description: 'app.addaccount.newbaseclass.referralinput.placeholder: Tooltip for the referral input'},
  tooltip: {
        defaultMessage: 'A referral code from an existing client is required to create an account',
        description: 'Referral tooltip when creating a new account'},
  error : {
      defaultMessage: 'Registering this account failed. Please contact support@thecoin.io',
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
      description: 'app.addaccount.newbaseclass.referralinput.errorReferrerUnknown'},
  referralRequest1: {
    defaultMessage: 'No referral code?',
    description: 'Create account link to request referral code'},
  referralRequest2: {
      defaultMessage: 'Request one here',
      description: 'Create account link to request referral code'},
});

type Props = {
  disabled?: boolean,
  forceValidate?: boolean,
  setReferral: (value: MaybeString) => void;
}

export const ReferralInput = (props: Props) => {

  const { setReferral, ...rest} = props;
  return (
    <>
      <UxInput
        onValue={props.setReferral}
        onValidate={validateReferral}
        intlLabel={translations.labelReferrer}
        tooltip={translations.tooltip}
        placeholder={translations.placeholder}
        {...rest}
      />
      <div className={styles.request}>
        <FormattedMessage {...translations.referralRequest1} />&nbsp;
        <a href={`${process.env.URL_SITE_LANDING}/#/applyBeta`}>
          <FormattedMessage {...translations.referralRequest2} />
        </a>
      </div>
    </>
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

const validateReferral = async (value: string) => {
  return value.length !== 6
      ? translations.errorReferrerNumChars
      : !IsValidShortCode(value)
        ? translations.errorReferrerInvalidCharacters
        : !(await isLegalReferral(value))
          ? translations.errorReferrerUnknown
          : null;
};
