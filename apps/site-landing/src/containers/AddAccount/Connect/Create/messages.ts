/*
 * HomePage Messages
 *
 * This contains all the text for the HomePage container.
 */
import { defineMessages } from 'react-intl';

export const scope = 'app.containers.Account.Connect.Create';

export default defineMessages({
  header: {
    id: `${scope}.header`,
    defaultMessage: 'Compatible account detected',
  },

  subHeader: {
    id: `${scope}.subHeader`,
    defaultMessage:
      'We have detected a compatible account in your browser.  To register it with TheCoin, enter a name and your referral code'
  },

  createTransfer: {
    id: `${scope}.createTransfer`,
    defaultMessage:
      'Or, you can create an entirely new account!',
  },

  checkHeader: {
    id: `${scope}.checkHeader`,
    defaultMessage:
      'Is this what you meant?',
  },
  checkMessageOpera: {
    id: `${scope}.checkMessageOpera`,
    defaultMessage:
      'The Opera browser you are using comes with a built-in account that is compatible with TheCoin. Would you like to connect to it?'
  },

  checkHeaderFailed: {
    id: `${scope}.checkHeaderFailed`,
    defaultMessage:
      'No compatible account detected!',
  },
  checkMessageFailed: {
    id: `${scope}.checkMessageFailed`,
    defaultMessage:
      'We cannot detect a compatible account in this browser.  If you would like to use an external account provider, we recommend installing Metamask or using the Opera Browser',
  },
});
