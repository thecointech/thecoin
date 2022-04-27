//

import React from 'react';
import { defineMessage } from 'react-intl';
import { AccountVerifyDisplay } from './Display';
import verifiedImg from './images/verified_yes_icon.svg';


const verified = {
  icon: verifiedImg,
  title: defineMessage({
    defaultMessage: 'Verification in process',
    description: 'app.settings.verified.titleVerified: Title for the verfified section in the setting page in the app'}),
  description: defineMessage({
    defaultMessage: 'Your submission is being processed.',
    description: 'app.settings.verified.descriptionVerified: message shown if account has been verified'}),
}

// Component to show if the account is already verified
export const InProcess = () =>
  <AccountVerifyDisplay
    data={verified}
    button={<br />}
  />
