/*
 * HomePage Messages
 *
 * This contains all the text for the HomePage container.
 */
import { defineMessages } from 'react-intl';

export const scope = 'app.containers.account.Create';

export default defineMessages({
  labelName: {
    id: `${scope}.labelName`,
    defaultMessage: 'Account Name',
  },
  labelPassword: {
    id: `${scope}.labelPassword`,
    defaultMessage: 'Password',
  },
  labelReferrer: {
    id: `${scope}.labelReferrer`,
    defaultMessage: 'Referral Code',
  },
  buttonCreate: {
    id: `${scope}.buttonCreate`,
    defaultMessage: 'CREATE ACCOUNT',
  },

  errorNameTooShort: {
    id: `${scope}.errorNameTooShort`,
    defaultMessage: 'An account must have a name.',
  },
  errorNameDuplicate: {
    id: `${scope}.errorNameDuplicate`,
    defaultMessage: 'An account with this name already exists here.',
  },
  errorPasswordRequired: {
    id: `${scope}.errorPasswordRequired`,
    defaultMessage: "Please enter a password of at least 'moderate' strength",
  },

  errorReferrerNumChars: {
    id: `${scope}.errorReferrerNumChars`,
    defaultMessage: 'A referrer ID should be 6 characters long.',
  },
  errorReferrerInvalidCharacters: {
    id: `${scope}.errorReferrerInvalidCharacters`,
    defaultMessage: 'A referrer ID should only contain alpha-numeric characters.',
  },
  errorReferrerUnknown: {
    id: `${scope}.errorReferrerUnknown`,
    defaultMessage: "The entered referrer ID is not recognized",
  },
});
