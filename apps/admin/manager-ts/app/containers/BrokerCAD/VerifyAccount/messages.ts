/*
 * HomePage Messages
 *
 * This contains all the text for the HomePage container.
 */
import { defineMessages } from 'react-intl';

export const scope = 'app.containers.Account.Verify';

export default defineMessages({
  header: {
    id: `${scope}.header`,
    defaultMessage: 'Verify an Account',
  },
  subHeader: {
    id: `${scope}.subHeader`,
    defaultMessage:
      'A verified account can refer other accounts.',
  },
  labelAccount: {
    id: `${scope}.labelAccount`,
    defaultMessage: 'Account to Verify',
  },
  buttonVerify: {
    id: `${scope}.buttonVerify`,
    defaultMessage: 'VERIFY ACCOUNT',
  }
});
