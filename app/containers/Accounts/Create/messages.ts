/*
 * HomePage Messages
 *
 * This contains all the text for the HomePage container.
 */
import { defineMessages, Messages } from 'react-intl';

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
  accountName: {
    id: `${scope}.accountName`,
    defaultMessage: 'Account Name.',
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
