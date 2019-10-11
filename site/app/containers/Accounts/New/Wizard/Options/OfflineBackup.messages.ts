/*
  Offline Backup Storage Option
 */
import { defineMessages } from 'react-intl';

export const scope = 'app.containers.Account.OfflineBackup';

export default defineMessages({
  header: {
    id: `${scope}.header`,
    defaultMessage: 'Offline backup',
  },
  description: {
    id: `${scope}.desc`,
    defaultMessage:
      'For people who cannot be certain they will remember their passwords.\
      You can print a copy of your wallet without password protections for\
      easy restoration.  However, just like a physical wallet, if you\
      store this physical backup insecurely anyone with access to it can\
      take money out of it (so keep it safe, and only use this for small accounts!)',
  },
  auth: {
    id: `${scope}.auth`,
    defaultMessage: 'Physical wallet access',
  },
  pros: {
    id: `${scope}.pros`,
    defaultMessage: 'Password-less recovery',
  },
  cons: {
    id: `${scope}.cons`,
    defaultMessage: 'Low security.  Only suitable for low-value accounts',
  },
});