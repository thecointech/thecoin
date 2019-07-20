/*
	Offline Backup Storage Option
 */
import { defineMessages } from 'react-intl';

export const scope = 'app.containers.Account.OfflineCold';

export default defineMessages({
  header: {
    id: `${scope}.header`,
    defaultMessage: 'Cold Storage',
  },
  description: {
    id: `${scope}.desc`,
    defaultMessage:
			"The gold standard of security.  Print your account out, remove it\
			from your device, and store it in a safety-deposit box.  Stored like this,\
			the only way to access the account is by accessing the safety\
			deposit box. Great for a high-value long-term savings account.\
			Cannot be used for day-to-day transactions",
	},
	auth: {
		id: `${scope}.auth`,
    defaultMessage: "Safety box, (optional) password"
	},
	pros: {
		id: `${scope}.pros`,
    defaultMessage: "Can store unlocked to avoid possibility of forgotten passwords."
	},
	cons: {
		id: `${scope}.cons`,
    defaultMessage: "Expensive.  Single point of failure.  Not usable while stored"
	}
});