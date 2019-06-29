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
    defaultMessage: 'Connect your existing Web3 account',
  },
  subHeader: {
    id: `${scope}.subHeader`,
    defaultMessage:
      'To connect your account to this site, enter in your referrer and any name you like',
	}
})