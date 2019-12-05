/*
	Offline Backup Storage Option
 */
import { defineMessages } from 'react-intl';

export const scope = 'app.containers.Account.OfflineSecureBackup';

export default defineMessages({
  header: {
    id: `${scope}.header`,
    defaultMessage: 'Offline backup',
  },
  description: {
    id: `${scope}.desc`,
    defaultMessage:
			"We print out your password-protected account for offline safe-keeping, and store\
			the password in a password manager.  We strongly suggest keeping multiple copies\
			of your wallet in multiple locations in case of catastrophics events",
	},
	auth: {
		id: `${scope}.auth`,
    defaultMessage: "Physical wallet, online password"
	},
	pros: {
		id: `${scope}.pros`,
    defaultMessage: "Very strong security.  Portable"
	},
	cons: {
		id: `${scope}.cons`,
    defaultMessage: "Manual and inconvenient, requires deep understanding of the risks.  Not recommended for unfamiliar users"
	}
});