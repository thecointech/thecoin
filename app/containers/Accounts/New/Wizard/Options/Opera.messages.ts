/*
	Offline Backup Storage Option
 */
import { defineMessages } from 'react-intl';

export const scope = 'app.containers.Account.Opera';

export default defineMessages({
  header: {
    id: `${scope}.header`,
    defaultMessage: 'Opera Browser wallet',
  },
  description: {
    id: `${scope}.desc`,
    defaultMessage:
			"The Opera browser provides a built-in account compatible with The Coin.  The\
			account is stored on your cellphone, and requires two-factor authentication\
			in the form of an unlock code or a fingerprint when being used.  We like this account\
			because it provides a fantastic combo of security and convenience.  It's downsides are\
			that it requires a lot of setup and use of a specific browser",
	},
	auth: {
		id: `${scope}.auth`,
    defaultMessage: "Physical device, fingerprint/unlock code"
	},
	pros: {
		id: `${scope}.pros`,
    defaultMessage: "Most secure for every-day usage"
	},
	cons: {
		id: `${scope}.cons`,
    defaultMessage: "Greatest setup time compared to other options"
	}
});