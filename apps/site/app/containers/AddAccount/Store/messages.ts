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
    defaultMessage: 'Backup your new account.',
  },
  subHeader: {
    id: `${scope}.subHeader`,
    defaultMessage: 'Where would you like to store your account?',
  },
  infop1: {
    id: `${scope}.infop1`,
    defaultMessage: 'It is very important that you backup your account somewhere safe to avoid losing it.'
  },
  infop2: {
    id: `${scope}.infop2`,
    defaultMessage: 'For most accounts, we recommend you backup your account to an online storage like Google Drive.'
  },
  infop3: {
    id: `${scope}.infop3`,
    defaultMessage: 'If you prefer, you may download and manage your own backups.'
  },
  faqLink: {
    id: `${scope}.faqLink`,
    defaultMessage: 'For more information on account backup and security, we recommend reading the FAQs'
  },

  gotoAccount: {
    id: `${scope}.gotoAccount`,
    defaultMessage: 'Your Done - Lets Go!',
  },
});
