/*
 * HomePage Messages
 *
 * This contains all the text for the HomePage container.
 */
import { defineMessages } from 'react-intl';

export const scope = 'app.containers.accounts.Login';

export default defineMessages({
  header: {
    id: `${scope}.header`,
    defaultMessage: 'Deposit Instructions',
  },
  subHeader: {
    id: `${scope}.subHeader`,
    defaultMessage: 'Transfer funds from your Canadian bank to your account.',
  },


  getTransferCodeHeader: {
    id: `${scope}.getTransferCodeHeader`,
    defaultMessage: 'Please wait...',
  },
  haveTransferCodeHeader: {
    id: `${scope}.haveTransferCodeHeader`,
    defaultMessage: 'Your details:',
  },
  fetchTransferCode: {
    id: `${scope}.fetchTransferCodeMessage`,
    defaultMessage: 'We are generating your individual e-Transfer recipient info',
  },
  yourTransferCode: {
    id: `${scope}.yourTransferCode`,
    defaultMessage: 'The following is your personalized e-Transfer info:',
  },
  yourTransferRecipient: {
    id: `${scope}.yourTransferRecipient`,
    defaultMessage: 'Recipient:',
  },
  yourTransferSecret: {
    id: `${scope}.yourTransferSecret`,
    defaultMessage: 'Secret:',
  },
});
