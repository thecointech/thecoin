/*
 * HomePage Messages
 *
 * This contains all the text for the HomePage container.
 */
import { defineMessages } from 'react-intl';

export const scope = 'app.containers.accounts.Transfer';

export default defineMessages({
  header: {
    id: `${scope}.header`,
    defaultMessage: 'Direct Transfer',
  },
  subHeader: {
    id: `${scope}.subHeader`,
    defaultMessage: "Transfer directly to another account with TheCoin.",
  },
  transferOutHeader: {
    id: `${scope}.transferHeader`,
    defaultMessage: "Processing Transfer...",
  },
  step1: {
    id: `${scope}.step1`,
    defaultMessage: "Step 1 of 3:\nChecking transfer availability...",
  },
  step2: {
    id: `${scope}.step2`,
    defaultMessage: "Step 2 of 3:\nSending transfer command to our servers...",
  },
  step3: {
    id: `${scope}.step3`,
    defaultMessage: "Step 3 of 3:\nWaiting for the transfer to be accepted\n(check progress {link})...",
  },
  transferOutProgress: {
    id: `${scope}.transferOutProgress`,
    defaultMessage: "Please wait, we are sending your order to our servers...",
  },
  // labelAccount: {
  //   id: `${scope}.transferTo`,
  //   defaultMessage: "Destination Address",
  // }
});
