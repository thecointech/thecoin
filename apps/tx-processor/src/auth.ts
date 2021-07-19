import http from 'http';
import url from 'url';
import { log } from '@thecointech/logging';
import open from "open";

export function getCode(url: string) {
  log.debug('Begin OAuth process');
  open(url);
  return listenForCode();
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
