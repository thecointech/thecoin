/*
 * HomePage Messages
 *
 * This contains all the text for the HomePage container.
 */
import { defineMessages } from 'react-intl';

export const scope = 'app.containers.Account.Wizard';

export default defineMessages({
  header: {
    id: `${scope}.header`,
    defaultMessage: 'New Account Wizard',
  },
  subHeader: {
    id: `${scope}.subHeader`,
    defaultMessage:
      'This wizard will guide you to the best combination of security and convenience for you',
  },
	
	valueHeader: {
    id: `${scope}.valueHeader`,
    defaultMessage: 'Account Value',
	},
	valueMessage: {
    id: `${scope}.valueMessage`,
    defaultMessage: 'What is the likely value of your account',
	},
	valueMessageMouseOver: {
    id: `${scope}.valueMessageMouseOver`,
    defaultMessage: 'The more value in an account, the higher security and less convenience we recommend',
  },
  

  convenienceHeader: {
    id: `${scope}.convenienceHeader`,
    defaultMessage: 'Account Convenience',
	},
	convenienceMessage: {
    id: `${scope}.convenienceMessage`,
    defaultMessage: 'Please rate your desired convenience vs security',
	},
	convenienceMessageMouseOver: {
    id: `${scope}.convenienceMessageMouseOver`,
    defaultMessage: 'The more convenience in an account, the higher security and less convenience we recommend',
	},

  warningP1: {
    id: `${scope}.warningP1`,
    defaultMessage:
      'This feature connects The Coin to an external Web3 account provider.',
  },
  warningP2: {
    id: `${scope}.warningP2`,
    defaultMessage:
      'To use this feature, either install the MetaMask plugin or try the new Opera browser!',
  },
});
