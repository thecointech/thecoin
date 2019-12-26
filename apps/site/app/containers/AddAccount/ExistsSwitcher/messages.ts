import { defineMessages } from 'react-intl';

export const scope = 'app.containers.Account.Exist';

export default defineMessages({
  existTransfer: {
    id: `${scope}.existTransfer`,
    defaultMessage:
      'Load using a different method',
  },
  existRestore: {
    id: `${scope}.existRestore`,
    defaultMessage:
      'Load an account stored online',
  },
  existConnect: {
    id: `${scope}.existConnect`,
    defaultMessage:
      'Connect to an existing Ethereum Account',
  },
  existUpload: {
    id: `${scope}.existRestore`,
    defaultMessage:
      'Upload an account saved manually',
  }
});