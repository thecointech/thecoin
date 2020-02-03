/*
 * HomePage Messages
 *
 * This contains all the text for the HomePage container.
 */
import { defineMessages } from 'react-intl';

export const scope = 'app.containers.Account.Store';

export default defineMessages({
  header: {
    id: `${scope}.header`,
    defaultMessage: 'Upload your new account.',
  },
  subHeader: {
    id: `${scope}.subHeader`,
    defaultMessage: 'Where would you like to store your account? ',
  },
  infop1: {
    id: `${scope}.infop1`,
    defaultMessage: 'Accounts with TheCoin are a little different to your regular bank.\
      We are built on the blockchain, which means that we dont store your account keys - you do!'
  },
  infop2: {
    id: `${scope}.infop2`,
    defaultMessage: 'There are many advantages to storing your details like this - if you would like to read more,'
  },
  faqLink: {
    id: `${scope}.faqLink`,
    defaultMessage: 'please visit our FAQs'
  },
});
