import http from 'http';
import { log } from '@thecointech/logging';
import open from "open";
import type { OAuth2Client } from 'google-auth-library';
import { getAuthConfig } from './authConfig';
import { getTempSecret, setTempSecret, deleteTempSecret } from '@thecointech/secrets/temp';
import { sleep } from '@thecointech/async';
import { randomUUID } from 'crypto';

// If modifying these scopes, delete token.json.
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.modify',
];

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param oAuth2Client The OAuth2 client to get token for.
 */
export async function getNewTokens(oAuth2Client: OAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  const code = await getCode(authUrl);
  const response = await oAuth2Client.getToken(code);
  return response.tokens;
}

/** Get code to be swapped for token */
export async function getCode(url: string) {
  if (process.env.THECOIN_CONSOLE_ONLY) {
    return await getTokenBitwarden(url);
  }
  return await getTokenUrl(url);
}

export const getUniqueUrlKey = (id: string) => `TEMP_GMAIL_URL_${id}`
export const getUniqueTokenKey = (id: string) => `TEMP_GMAIL_TOKEN_${id}`
async function getTokenBitwarden(url: string) {
  // first, generate a unique id
  const uniqueId = randomUUID();
  await setTempSecret(getUniqueUrlKey(uniqueId), url);
  log.info(`Initialized token request with id: ${uniqueId}`);
  const pollingInterval = 5000;
  const timeout = 5 * 60 * 1000;
  // now, poll for the token for up to 5 minutes
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      await sleep(pollingInterval);
      return await getTempSecret(getUniqueTokenKey(uniqueId));
    } catch (e) {
      // Ignore
    }
  }
  // Clear the temp secrets
  await deleteTempSecret(getUniqueUrlKey(uniqueId));
  throw new Error("Timeout waiting for token");
}

export async function getTokenUrl(url: string) {
  log.debug(`Begin OAuth process: ${url}`);
  try {
    open(url);
  }
  catch {
    log.debug(`Please go to:\n${url}`);
  }
  const authConfig = await getAuthConfig();

  return new Promise<string>((resolve, reject) => {

    const server = http.createServer(async (req, res) => {
      if (!req.url)
        return;
      const path = new URL(req.url, authConfig.Uri);
      if (path.pathname == '/gauth') {
        clearTimeout(serverTimeout);
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
          reject(new Error("Invalid code"));
        }
      } else {
        res.statusCode = 404;
        res.end();
      }
    }).listen(authConfig.ListenerPort, "localhost", () => log.debug("Waiting for code"));

    // Give a 10 minute timeout, then throw
    const serverTimeout = setTimeout(() => {
      server.close();
      reject(new Error("Timeout waiting for code"));
    }, 10 * 60 * 1000);
  })
}
