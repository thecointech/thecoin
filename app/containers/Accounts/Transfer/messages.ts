/*
 * HomePage Messages
 *
 * This contains all the text for the HomePage container.
 */
import { defineMessages } from 'react-intl';

export const scope = 'app.containers.Accounts.Transfer';

export default defineMessages({
  header: {
    id: `${scope}.header`,
    defaultMessage: 'Transfer To',
  },
  subHeader: {
    id: `${scope}.subHeader`,
    defaultMessage: "Transfer directly to another coin account.",
  },
  transferOutHeader: {
    id: `${scope}.transferHeader`,
    defaultMessage: "Processing Transfer...",
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
