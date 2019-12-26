import { defineMessages } from 'react-intl';

export const scope = 'app.containers.Accounts.Upload';

export default defineMessages({
  header: {
    id: `${scope}.header`,
    defaultMessage: 'Load a Saved Account',
  },
  subHeader: {
    id: `${scope}.subHeader`,
    defaultMessage: "If you have previously saved out an account as a .json file, you can load it back in here",
	}
});