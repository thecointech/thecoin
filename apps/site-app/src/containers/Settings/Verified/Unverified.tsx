import { log } from '@thecointech/logging';
import { Account } from '@thecointech/shared/containers/Account/reducer';
import { useScript } from '@thecointech/shared/useScript';
import { ButtonSecondary } from '@thecointech/site-base/components/Buttons';
import React from 'react';
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



declare global {
  interface Window {
    BlockpassKYCConnect: any;
  }
}
//
// Component to show if the account is needs verification
export const Unverified = ({address, details}: PropsVerified) => {

  const accountApi = Account(address).useApi();
  const state = useScript('https://cdn.blockpass.org/widget/scripts/release/3.0.2/blockpass-kyc-connect.prod.js');
  React.useEffect(() => {
    if (state != "ready") return;
    // The first render, this will be null and we'll need to skip
    if (!window.BlockpassKYCConnect) return;
    const blockpass = new window.BlockpassKYCConnect(
      process.env.BLOCKPASS_CLIENT_ID,
      {
        // env: process.env.BLOCKPASS_ENV, // This apparently does not work?
        refId: address,
        email: details.email,
      })

    blockpass.startKYCConnect();
  }, [state])

  return (
    <>
      <AccountVerifyDisplay
        data={unverified}
        button={
          <ButtonSecondary
            id="blockpass-kyc-connect"
            loading={state == "loading"}
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
