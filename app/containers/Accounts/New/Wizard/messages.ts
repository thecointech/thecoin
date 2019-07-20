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
    defaultMessage: 'New Account Setup',
  },
  subHeader: {
    id: `${scope}.subHeader`,
    defaultMessage:
      'The Coin accounts are built on blockchain technology.\
      Correctly setup, these accounts provide a level of security\
      unmatched by traditional institutions.  This wizard will\
      guide you to ensure your account is stored safely according\
      to your needs and wants.',
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

  techChoiceHeader: {
    id: `${scope}.techChoiceHeader`,
    defaultMessage: 'Technical Options',
	},
	techChoiceMessage: {
    id: `${scope}.techChoiceMessage`,
    defaultMessage: 'Are you comfortable with either of these actions?',
	},
	techChoiceMessageMouseOver: {
    id: `${scope}.techChoiceMessageMouseOver`,
    defaultMessage: 'If you aren\'t sure, leave these blank',
  },
  
  convenienceHeader: {
    id: `${scope}.convenienceHeader`,
    defaultMessage: 'Account Preferences',
	},
	convenienceMessage: {
    id: `${scope}.convenienceMessage`,
    defaultMessage: 'Do you prefer convenience or security?',
	},
	convenienceMessageMouseOver: {
    id: `${scope}.convenienceMessageMouseOver`,
    defaultMessage: 'Certain options - ie always online, or the ability to restore without a password, are convenient but result in lower security',
  },
  
  accessibilityHeader: {
    id: `${scope}.accessibilityHeader`,
    defaultMessage: 'Account Accessibility',
	},
	accessibilityMessage: {
    id: `${scope}.accessibilityMessage`,
    defaultMessage: 'Do you want to be able to access your account from any computer (eg - from Internet Cafe)?',
	},
	accessibilityMessageMouseOver: {
    id: `${scope}.accessibilityMessageMouseOver`,
    defaultMessage: 'This may be necessary if you ever need to access your account from, for example, an internet cafe',
	},

  recommendHeader: {
    id: `${scope}.recommendHeader`,
    defaultMessage: 'Account Recommendations',
	},
	recommendMessage: {
    id: `${scope}.recommendMessage`,
    defaultMessage: 'We think the following options will work well for your requirements, choose the one that you like best',
  },
});
