import React from 'react'
import { AccountDetails } from '@thecointech/account';
import { defineMessages, FormattedMessage } from 'react-intl'

const translations = defineMessages({
  label: {
    defaultMessage: 'Referral code',
    description: 'app.settings.userDetails.code: Label for the info for the tab User details in the setting page in the app'
  },
  generating: {
    defaultMessage: 'We are generating your code, please check back in a few hours',
    description: 'app.settings.userDetails.codeInfos: Label for the info for the tab User details in the setting page in the app'
  },
  pleaseVerify: {
    defaultMessage: 'You need to verify your account to obtain one',
    description: 'app.settings.userDetails.codeInfos: Label for the info for the tab User details in the setting page in the app'
  },
});

export const ReferralCode = ({ referralCode, status }: AccountDetails) => (
  <>
    <div className={"font-label border-top-green4 x4spaceBefore x4spaceAfter"} ><FormattedMessage {...translations.label} /></div>
    <div className={"x4spaceAfter"}>{
      referralCode
        ? referralCode
        : <FormattedMessage {
          ...(status == "approved"
            ? translations.generating
            : translations.pleaseVerify
          )
        } />
    }
    </div>
  </>
)
