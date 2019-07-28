/*
	Offline Backup Storage Option
 */
import { defineMessages } from 'react-intl';

export const scope = 'app.containers.Create.Cloud';

export default defineMessages({
  stepHeader: {
    id: `${scope}.stepHeader`,
    defaultMessage: 'Cloud Storage',
  },
  stepSubHeader: {
    id: `${scope}.stepSubHeader`,
    defaultMessage: 'Access your wallet everywhere',
  },
  header: {
    id: `${scope}.header`,
    defaultMessage: 'Upload your account',
	},
	subHeader: {
    id: `${scope}.subHeader`,
    defaultMessage: 'A wallet stored online is always available',
  },
  para1: {
    id: `${scope}.para1`,
    defaultMessage:
			"If you have an account with either google or microsoft, we can upload your wallet\
			directly to your cloud storage for safe-keeping.",
	}
});