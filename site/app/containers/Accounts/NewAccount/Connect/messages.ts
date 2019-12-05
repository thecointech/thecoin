/*
 * HomePage Messages
 *
 * This contains all the text for the HomePage container.
 */
import { defineMessages } from 'react-intl';

export const scope = 'app.containers.Account.Connect';

export default defineMessages({

  warningHeader: {
    id: `${scope}.warningHeader`,
    defaultMessage: 'No external providers detected!',
  },
  warningP1: {
    id: `${scope}.warningP1`,
    defaultMessage:
      'This feature connects The Coin to an external Web3 account provider.',
  },
  warningP2: {
    id: `${scope}.warningP2`,
    defaultMessage:
      'To use this feature, either install the MetaMask plugin or try the new Opera browser!',
  },

  createTransfer: {
    id: `${scope}.createTransfer`,
    defaultMessage:
      'Or, you can create an entirely new account!',
  },
  existOnline: {
    id: `${scope}.existOnline`,
    defaultMessage:
      'Or, if you can restore an account generated previously',
  },
});
