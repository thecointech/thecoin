/*
	Offline Backup Storage Option
 */
import { defineMessages } from 'react-intl';

export const scope = 'app.containers.Account.Cloud';

export default defineMessages({
  header: {
    id: `${scope}.header`,
    defaultMessage: 'Online Cloud storage',
  },
  description: {
    id: `${scope}.desc`,
    defaultMessage:
			"A balanced all-round approach to usability and security for every-day accounts. \
			We store your password-encrypted account on your own cloud storage.\
			With this method we rely on you to store and remember your own password.\
			We recommend simply writing it down and storing the paper somewhere safe",
	},
	auth: {
		id: `${scope}.auth`,
    defaultMessage: "Cloud provider login, account password"
	},
	pros: {
		id: `${scope}.pros`,
    defaultMessage: "Instant access, decent security"
	},
	cons: {
		id: `${scope}.cons`,
    defaultMessage: "No password-less recovery"
	}
});