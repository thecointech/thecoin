/*
	Offline Backup Storage Option
 */
import { defineMessages } from 'react-intl';

export const scope = 'app.containers.Create.Intro';

export default defineMessages({
  header: {
    id: `${scope}.header`,
    defaultMessage: 'The Opera Browser',
	},
	subHeader: {
    id: `${scope}.subHeader`,
    defaultMessage: 'Using the Opera Browser built-in wallet',
  },
  para1: {
    id: `${scope}.para1`,
    defaultMessage:
			"The Opera browser with it's built-in wallet is highly recommended to those who want a daily-use wallet with an\
			exceptional level of security.  The wallet is stored on your android device, and is secured by fingerprint or\
			pin phrase.",
	},
	installLinkPre: {
    id: `${scope}.installLink`,
    defaultMessage:
			"First,",
	},
	installLink: {
    id: `${scope}.installLink`,
    defaultMessage:
			"download and install the Opera Browser",
	},
	copyPageLinkPre: {
    id: `${scope}.copyPageLinkPre`,
    defaultMessage:
			"Once done, copy and paste ",
	},
	copyPageLink: {
    id: `${scope}.copyPageLink`,
    defaultMessage:
			"the link to this page",
	},
	copyPageLinkPost: {
    id: `${scope}.copyPageLinkPost`,
    defaultMessage:
			"into the Opera browser address bar",
	},
	connectTutPre: {
    id: `${scope}.connectTutPre`,
    defaultMessage:
			"For more information, ",
	},
	connectTut: {
    id: `${scope}.connectTut`,
    defaultMessage:
			"read this tutorial on connecting Opera on your Android Phone to your Browser",
	},

	detected: {
    id: `${scope}.detected`,
    defaultMessage:
			"Web3-capable browser detected.  Continue to the next step.",
	}
});