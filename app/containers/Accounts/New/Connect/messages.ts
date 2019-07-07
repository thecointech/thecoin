/*
 * HomePage Messages
 *
 * This contains all the text for the HomePage container.
 */
import { defineMessages } from 'react-intl';

export const scope = 'app.containers.Account.Connect';

export default defineMessages({
  header: {
    id: `${scope}.header`,
    defaultMessage: 'Connect an external account',
  },
  subHeader: {
    id: `${scope}.subHeader`,
    defaultMessage:
      'To connect an existing account to this site, enter in your referrer and any name you like',
  },
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
});
