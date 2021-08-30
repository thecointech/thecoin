/*
 * HomePage Messages
 *
 * This contains all the text for the HomePage container.
 */
import { defineMessages } from 'react-intl';

export const scope = 'app.containers.account.Connect';

export default defineMessages({
  header: {
    id: `${scope}.header`,
    defaultMessage: 'Restore accounts from Google',
  },
  subHeader: {
    id: `${scope}.subHeader`,
    defaultMessage:
      'If you have previously connected a Coin account to your google account, click below to restore it'
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