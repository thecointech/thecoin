/*
 * HomePage Messages
 *
 * This contains all the text for the HomePage container.
 */
import { defineMessages } from "react-intl";

export const scope = "app.containers.Accounts.Login";

export default defineMessages({
  decryptHeader: {
    id: `${scope}.decryptHeader`,
    defaultMessage: "Logging into your account."
  },
  decryptIncorrectPwd: {
    id: `${scope}.decryptIncorrectPwd`,
    defaultMessage: "Unlock failed: Please check your password and try again."
  },
  decryptCancelled: {
    id: `${scope}.decryptCancelled`,
    defaultMessage: "Unlock cancelled."
  },
  decryptSuccess: {
    id: `${scope}.decryptSuccess`,
    defaultMessage:
      "Unlock successful!  Please wait while we load your account info"
  },
  decryptInProgress: {
    id: `${scope}.decryptInProgress`,
    defaultMessage:
      "Please wait, We are {percentComplete}% done opening your account."
  }
});
