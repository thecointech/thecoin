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
      'Your browser already has an account compatible with the Coin.  Would you like to connect with it?',
  },
  createTransfer: {
    id: `${scope}.createTransfer`,
    defaultMessage:
      'Or, you can create an entirely new account!',
  }
});
