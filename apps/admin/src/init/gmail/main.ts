import http from 'http';
import url from 'url';
import { log } from '@thecointech/logging';
import open from "open";
import { GMAIL_CHANNEL_REPLY, GMAIL_CHANNEL_SEND } from './common';
import { ipcMain } from 'electron';

export function registerGmailListener() {
  ipcMain.on(GMAIL_CHANNEL_SEND, async (event, authUrl) => {
    open(authUrl);
    try {
      const code = await listenForCode();
      event.sender.send(GMAIL_CHANNEL_REPLY, code);
    }
    catch (err) {
      console.error(err);
      event.sender.send(GMAIL_CHANNEL_REPLY);
    }
  })
}


// Simple callback to wait for redirect from Google
function listenForCode() {
  return new Promise<string>((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      if (!req.url)
        return;
      const path = new url.URL(req.url, process.env.TX_GMAIL_CLIENT_URI);
      if (path.pathname == '/gauth') {
        const code = path.searchParams.get('code');

        if (code) {
          log.debug('Auth Successful');
          res.end(
            'Authentication successful! Please return to the console.'
          );
          server.close();
          resolve(code)
        } else {
          log.debug('Auth Failed: No code present');
          res.end('Invalid code');
          reject();
        }
      } else {
        res.statusCode = 404;
        res.end();
      }
    }).listen(Number(process.env.TX_GMAIL_CLIENT_LISTENER_PORT), "localhost", () => log.debug("Waiting for code"));
  })
}
