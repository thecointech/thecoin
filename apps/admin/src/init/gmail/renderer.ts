import { log } from '@thecointech/logging';
import { ipcRenderer } from 'electron';
import { GMAIL_CHANNEL_REPLY, GMAIL_CHANNEL_SEND } from './common';

export function gmailSignIn(authUrl: string) {
  return new Promise<string>((resolve, reject) => {
    log.debug('Begin OAuth process');
    ipcRenderer.send(GMAIL_CHANNEL_SEND, authUrl);
    ipcRenderer.on(GMAIL_CHANNEL_REPLY, (_event, code: string) => {
      log.debug('OAuth Complete');
      if (code) resolve(code);
      else reject("No code supplied");
    })
  })
}
