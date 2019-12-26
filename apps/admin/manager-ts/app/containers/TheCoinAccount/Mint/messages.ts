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
    defaultMessage: 'Minting is in progress.',
  },
  mintingInProgress: {
    id: `${scope}.mintingInProgress`,
    defaultMessage: 'Mint submitted under hash: ${txHash}',
  }
});
