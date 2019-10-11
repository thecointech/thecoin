/*
  Offline Backup Storage Option
 */
import { defineMessages } from 'react-intl';

export const scope = 'app.containers.Create.Intro';

export default defineMessages({
  header: {
    id: `${scope}.header`,
    defaultMessage: 'Install Metamask',
  },
  subHeader: {
    id: `${scope}.subHeader`,
    defaultMessage: 'Using the Metamask browser extension',
  },
  para1: {
    id: `${scope}.para1`,
    defaultMessage:
      'The Metamask browser extension provides an excellent way to store your account for every-day usage.\
      To learn more about how to work with Metamask, we recommend this tutorial:',
  },
  preInstall: {
    id: `${scope}.preInstall`,
    defaultMessage: 'Once your comfortable, follow this link to install the extension:',
  },
  para2: {
    id: `${scope}.para2`,
    defaultMessage:
      'Once done, return here and press F5 to refresh this page',
  },
  detected: {
    id: `${scope}.detected`,
    defaultMessage:
      'Web3-capable browser detected.  Continue to the next step.',
  },
});
