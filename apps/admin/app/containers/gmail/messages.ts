/*
 * HomePage Messages
 *
 * This contains all the text for the HomePage container.
 */
import { defineMessages } from 'react-intl';

export const scope = 'app.containers.Accounts.Login';

export default defineMessages({

  processingHeader: {
    id: `${scope}.processingHeader`,
    defaultMessage: 'Processing Deposit.',
  },
  processingInProgress: {
    id: `${scope}.processingInProgress`,
    defaultMessage: 'Processing deposit: {step} of {total}\n{currentAction}',
  },
  labelAccount: {
    id: `${scope}.labelAccount`,
    defaultMessage: 'Purchaser Account',
  }
});
