/*
 * HomePage Messages
 *
 * This contains all the text for the HomePage container.
 */
import { defineMessages } from 'react-intl';

export const scope = 'app.containers.Accounts.Settings.GAuth';

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
	}
});