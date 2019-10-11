/*
	Offline Backup Storage Option
 */
import { defineMessages } from 'react-intl';

export const scope = 'app.containers.Account.Metamask';

export default defineMessages({
  header: {
    id: `${scope}.header`,
    defaultMessage: 'Metamask Extension',
  },
  description: {
    id: `${scope}.desc`,
    defaultMessage:
			"Metamask is a browser extension that can be installed to store your\
			wallet.  This extension is provided by a reputable business with a good\
			reputation for taking security seriously.  It provides an extra layer\
			of security by removing the wallet from the website itself.  This means\
			that your account is safe even if your browser becomes infected with malicious spyware.",
	},
	auth: {
		id: `${scope}.auth`,
    defaultMessage: "Metamask, password"
	},
	pros: {
		id: `${scope}.pros`,
    defaultMessage: "Convenient, firewall between wallet and browser"
	},
	cons: {
		id: `${scope}.cons`,
    defaultMessage: "No cloud backup, requires installing browser extension"
	}
});