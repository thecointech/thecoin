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
    defaultMessage: 'Transfer Out',
  },
  subHeader: {
    id: `${scope}.subHeader`,
    defaultMessage: "Transfer out with an interac e-Transfer.",
  },
  transferOutHeader: {
    id: `${scope}.sellHeader`,
    defaultMessage: "Processing Transfer out...",
  },
  transferOutProgress: {
    id: `${scope}.transferOutProgress`,
    defaultMessage: "Please wait, we are sending your order to our servers...",
  },
});
