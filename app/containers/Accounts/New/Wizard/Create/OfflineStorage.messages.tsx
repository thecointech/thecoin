/*
	Offline Backup Storage Option
 */
import { defineMessages } from 'react-intl';

export const scope = 'app.containers.Create.Intro';

export default defineMessages({
  header: {
    id: `${scope}.header`,
    defaultMessage: 'Offline Storage',
	},
	subHeader: {
    id: `${scope}.subHeader`,
    defaultMessage: 'Store your wallet in the real world',
  },
  para1: {
    id: `${scope}.para1`,
    defaultMessage:
			"Storing your wallet offline gives a great way to keep your wallet safe from online threats.",
	}
});