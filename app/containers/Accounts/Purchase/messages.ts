/*
 * HomePage Messages
 *
 * This contains all the text for the HomePage container.
 */
import { defineMessages } from 'react-intl';

export const scope = 'app.containers.Accounts.Login';

export default defineMessages({
  header: {
    id: `${scope}.header`,
    defaultMessage: 'Transfer In',
  },
  subHeader: {
    id: `${scope}.subHeader`,
    defaultMessage: "Transfer funds into your account.",
  }
});
