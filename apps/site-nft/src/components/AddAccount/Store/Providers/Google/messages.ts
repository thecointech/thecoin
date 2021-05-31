/*
 * HomePage Messages
 *
 * This contains all the text for the HomePage container.
 */
import { defineMessages } from 'react-intl';

export const scope = 'app.containers.accounts.Settings.GAuth';

export default defineMessages({
  tokenSuccess: {
    id: `${scope}.success`,
    defaultMessage: 'Thank you for completing Google Authorization: This window can now be closed.',
  },
  tokenFailure: {
    id: `${scope}.failure`,
    defaultMessage: "This page expects to recieve google authentication information, but none was found.",
	},
	tokenWaiting: {
    id: `${scope}.waiting`,
    defaultMessage: "Please wait - we are checking for authentication",
	},
	cookieSuccess: {
    id: `${scope}.cookieSuccess`,
    defaultMessage: "Authentication passed, please return to your account and complete connecting to google",
  },
  
  buttonConnect: {
    id: `${scope}.buttonConnect`,
    defaultMessage: "CONNECT TO GOOGLE",
  },
  buttonSuccess: {
    id: `${scope}.buttonSuccess`,
    defaultMessage: "UPLOADED",
  },

  messageErrorRemoteHeader: {
    id: `${scope}.messageErrorRemoteHeader`,
    defaultMessage: "Cannot Upload",
  },
  messageErrorRemoteMessage: {
    id: `${scope}.messageErrorRemoteMessage`,
    defaultMessage: "This account isn't stored locally, and so cannot be uploaded to Google",
  },


  messageErrorFailedUploadHeader: {
    id: `${scope}.messageErrorFailedUploadHeader`,
    defaultMessage: "Upload Failed",
  },
  messageErrorFailedUploadMessage: {
    id: `${scope}.messageErrorFailedUploadMessage`,
    defaultMessage: "Something went wrong, your account has not been backed up.  Please contact support@thecoin.io",
  },

  messageSuccessHeader: {
    id: `${scope}.messageSuccessHeader`,
    defaultMessage: "Congratulations",
  },
  messageSuccessMessage: {
    id: `${scope}.messageSuccessMessage`,
    defaultMessage: "You have successfully backed up your account to your personal Google Drive",
  },
});