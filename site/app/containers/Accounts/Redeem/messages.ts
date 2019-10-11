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
  step1: {
    id: `${scope}.step1`,
    defaultMessage: "Step 1 of 3:\nChecking order availability...",
  },
  step2: {
    id: `${scope}.step2`,
    defaultMessage: "Step 2 of 3:\nSending sell order to our servers...",
  },
  step3: {
    id: `${scope}.step3`,
    defaultMessage: "Step 3 of 3:\nWaiting for the order to be accepted\n(check progress {link})...",
  },
  transferOutProgress: {
    id: `${scope}.transferOutProgress`,
    defaultMessage: "Please wait, we are sending your order to our servers...",
  },
});
