/*
 * HomePage Messages
 *
 * This contains all the text for the HomePage container.
 */
import { defineMessages } from 'react-intl';

export const scope = 'app.containers.Account.Connect.Exist';

export default defineMessages({
  header: {
    id: `${scope}.header`,
    defaultMessage: 'Compatible account detected',
  },
  subHeader: {
    id: `${scope}.subHeader`,
    defaultMessage:
      'Your browser has a compatible account, would you like to connect to it?',
  },
  existTransfer: {
    id: `${scope}.creaexistTransferteTransfer`,
    defaultMessage:
      'Or, you can restore an account previously saved online!',
  }
});
