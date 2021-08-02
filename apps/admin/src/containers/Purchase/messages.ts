/*
 * HomePage Messages
 *
 * This contains all the text for the HomePage container.
 */
import { defineMessages } from 'react-intl';

export const scope = 'app.containers.Accounts.Login';

export default defineMessages({

  mintingHeader: {
    id: `${scope}.mintingHeader`,
    defaultMessage: 'Processing Purchase.',
  },
  mintingInProgress: {
    id: `${scope}.mintingInProgress`,
    defaultMessage: 'Purchase step: {step}',
  },
  labelAccount: {
    id: `${scope}.labelAccount`,
    defaultMessage: 'Purchaser Account',
  }
});
