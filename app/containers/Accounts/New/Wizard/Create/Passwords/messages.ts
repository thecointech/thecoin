/*
  Offline Backup Storage Option
 */
import { defineMessages } from 'react-intl';

export const scope = 'app.containers.Create.Passwords';

export default defineMessages({
  stepHeader: {
    id: `${scope}.stepHeader`,
    defaultMessage: 'Passwords',
  },
  stepSubHeader: {
    id: `${scope}.stepSubHeader`,
    defaultMessage: 'Securing your accounts',
  },
  header: {
    id: `${scope}.header`,
    defaultMessage: 'Passwords',
  },
  subHeader: {
    id: `${scope}.subHeader`,
    defaultMessage: 'We need to talk about passwords...',
  },
  para1: {
    id: `${scope}.para1`,
    defaultMessage:
      'We get it.  Passwords are annoying.  Nobody likes to be nagged about improving their\
      passwords.  Unfortunately, the sad truth is though that.',
  },
  para1Link: {
    id: `${scope}.para1Link`,
    defaultMessage:
      '99% of us make things way too easy for the bad guys.',
  },
  para2: {
    id: `${scope}.para3`,
    defaultMessage:
      'The Coin want\'s to make you part of the secure 1%.  Fortunately, this isn\'t too difficult,\
      and will take less time than it takes to order a coffee!',
  },

  masterPassword: {
    id: `${scope}.masterPassword`,
    defaultMessage: 'Use this site to create a master passphrase:',
  },
  setMasterPwd: {
    id: `${scope}.setMasterPwd`,
    defaultMessage: 'Write down the passphrase.  You can use it in the next step as the master password to your password manager account',
  },

  passwordManagers: {
    id: `${scope}.passwordManagers`,
    defaultMessage: 'Next, install one of these password managers:',
  },

  usePasswordGenerator: {
    id: `${scope}.usePasswordGenerator`,
    defaultMessage:
      'Create an account with your password manager using the generated password from step 1',
  },
  profit: {
    id: `${scope}.profit`,
    defaultMessage:
      'Everytime you need a new password (including for The Coin), rely on your password\
      manager to generate passwords that are as long as complex as you like.',
  },
});
