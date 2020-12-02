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
    defaultMessage: 'Welcome to TheCoin',
  },
  subHeader: {
    id: `${scope}.subHeader`,
    defaultMessage: 'We are excited to have you join us.',
  },
  subHeader2: {
    id: `${scope}.subHeader2`,
    defaultMessage: 'To begin, let us quickly explain how we are different',
  },
  intro: {
    id: `${scope}.intro`,
    defaultMessage: 'Accounts with TheCoin are a little different to your regular bank.\
      We are built on the blockchain, which means that we don\'t store your account keys - you do!'
  },
  articles: {
    id: `${scope}.articles`,
    defaultMessage: 'If you\'ve never used a blockchain account, some of these differences can seem a bit strange.  We encourate you to read the short intro articles below if you would like to learn more.'
  },
  infoAdvantages: {
    id: `${scope}.infoAdvantages`,
    defaultMessage: 'We are very proud to combine the cutting-edge security and  performance of blockchain\
    with the the conveniences of traditional banking.'
  },
  newAccount: {
    id: `${scope}.newAccount`,
    defaultMessage: 'Create a New Account'
  },
});
