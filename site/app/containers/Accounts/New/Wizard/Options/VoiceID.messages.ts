/*
  Voice-ID Storage Option
 */
import { defineMessages } from 'react-intl';

export const scope = 'app.containers.Account.VoiceID';

export default defineMessages({
  header: {
    id: `${scope}.header`,
    defaultMessage: 'Voice-ID storage',
  },
  description: {
    id: `${scope}.desc`,
    defaultMessage:
      'We encrypt your unlocked account and store it on your own cloud storage,\
      along with a recording of your voice.  If you need to restore your account\
      we will call your listed number and compare the sound of your voice\
      to ensure the request is genuine before restoring your account',
  },
  auth: {
    id: `${scope}.auth`,
    defaultMessage: 'Cloud provider login, voice match',
  },
  pros: {
    id: `${scope}.pros`,
    defaultMessage: 'Can restore forgotten password',
  },
  cons: {
    id: `${scope}.cons`,
    defaultMessage: 'Slow restore time, voice-match is not as secure as other methods',
  },
});