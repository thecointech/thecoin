/*
 * HomePage Messages
 *
 * This contains all the text for the HomePage container.
 */
import { defineMessages } from 'react-intl';

export const scope = 'app.containers.Account.Create';

export default defineMessages({
  header: {
    id: `${scope}.header`,
    defaultMessage: 'Create a New Account',
  },
  subHeader: {
    id: `${scope}.subHeader`,
    defaultMessage:
      'Name your account anything you like, and give it a valid password.',
  },
  labelName: {
    id: `${scope}.labelName`,
    defaultMessage: 'Account Name',
  },
  labelPassword: {
    id: `${scope}.labelPassword`,
    defaultMessage: 'Password',
  },
  buttonCreate: {
    id: `${scope}.buttonCreate`,
    defaultMessage: 'CREATE ACCOUNT',
  },
  whileCreatingHeader: {
    id: `${scope}.whileCreatingHeader`,
    defaultMessage: 'Creating Account...',
  },

  whileCreatingMessage: {
    id: `${scope}.whileCreatingMessage`,
    defaultMessage:
      'We are {percentComplete}% done cooking your brand-new account.',
  },

  errorNameTooShort: {
    id: `${scope}.errorNameTooShort`,
    defaultMessage: 'An account must have a name.',
  },
});

// });

// interface SimpleMessages {
//   [id: string]: string;
// }

// interface FullMessage {
//   [index: string]: {
//     id: string;
//     defaultMessage: string;
//   };
// }

// function doDefineMessages<T extends SimpleMessages>(messages: T): T {
//   const asObj: Messages = {};
//   for (const key in messages) {
//     asObj[key as string] = {
//       id: `${scope}.${key}`,
//       defaultMessage: messages[key] as any,
//     };
//   }
//   return defineMessages(asObj);
// }

// export default doDefineMessages({
//   header: 'Create a New Account',
//   subHeader:
//     'Name your account anything you like, and give it a valid password.',
// });
