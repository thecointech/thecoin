import React from 'react';
import { log } from '@thecointech/logging';
import { useBlockpass } from '@thecointech/blockpass';
import { Account } from '@thecointech/shared/containers/Account';
import { ButtonSecondary } from '@thecointech/site-base/components/Buttons';
import { defineMessage, FormattedMessage } from 'react-intl';
import { AccountVerifyDisplay } from './Display';
import { PropsVerified } from './types';
import notverifiedImg from './images/verified_not_icon.svg';

const unverified = {
  icon: notverifiedImg,
  title : defineMessage({
    defaultMessage: 'Account not verified',
    description: 'app.settings.verified.titleNotVerified: message if account has not been verified'}),
  description: defineMessage({
    defaultMessage: 'Your account needs to be verified for better security.',
    description: 'app.settings.verified.descriptionNotVerified: Description for the verfified section in the setting page in the app'}),
}
const button = defineMessage({
  defaultMessage: 'Verify',
  description: 'app.settings.verified.buttonNotVerified: Button for the verfified section in the setting page in the app'});

//
// Component to show if the account is needs verification
export const Unverified = ({address, details, readonly}: PropsVerified) => {

  const accountApi = Account(address).useApi();
  const state = useBlockpass(address, details.user?.email, accountApi.checkKycStatus);

  return (
    <>
      <AccountVerifyDisplay
        data={unverified}
        button={
          <ButtonSecondary
            id="blockpass-kyc-connect"
            loading={state == "loading"}
            disabled={readonly}
            onClick={() => {
              log.debug("Opening KYC Dialog");
              accountApi.initKycProcess();
            }}
          >
            <FormattedMessage {...button} />
          </ButtonSecondary>
        }
      />
    </>
  )
}
