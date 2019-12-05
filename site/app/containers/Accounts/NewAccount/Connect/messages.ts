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
    defaultMessage: 'Compatible account detected',
  },
  subHeader: {
    id: `${scope}.subHeader`,
    defaultMessage:
      'Your browser already has an account compatible with the Coin.  Would you like to connect with it?',
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
