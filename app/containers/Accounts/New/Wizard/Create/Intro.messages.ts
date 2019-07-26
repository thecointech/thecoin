/*
	Offline Backup Storage Option
 */
import { defineMessages } from 'react-intl';

export const scope = 'app.containers.Create.Intro';

export default defineMessages({
  header: {
    id: `${scope}.header`,
    defaultMessage: 'Before we start...',
	},
	subHeader: {
    id: `${scope}.subHeader`,
    defaultMessage: 'A quick intro to The Coin account',
  },
  para1: {
    id: `${scope}.para1`,
    defaultMessage:
			"The Coin accounts are a little bit different to regular bank accounts, and\
			it is a good idea to take a quick moment to familiarise yourself with the\
			key differences.  In traditional accounts, a central authority (eg, a bank) holds\
			all of your information and decides on who should can get access to your account.",
	},
	para2: {
    id: `${scope}.para2`,
    defaultMessage:
			"We believe this approach is fundamentally flawed.  The 1 in 3 canadians who have been or will be a victim of fraud show that it is time to do better.",
	},
	para3: {
    id: `${scope}.para3`,
    defaultMessage:
			"The Coin is built on the blockchain model of security, which changes who holds the keys\
			to your account.  Instead of the bank holding your keys, who can be tricked into\
			giving the keys to a bad actor, you are the one given complete control over your account.\
			Nobody - not us, not the government, we mean nobody - can access your account without your\
			keys."
	},
	para4: {
    id: `${scope}.para4`,
    defaultMessage:
			"Of course, with this control comes an extra level of responsibility.  But don't worry - if you follow our guide, you'll be just fine..."
	}
});