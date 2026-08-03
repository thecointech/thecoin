import { getAuthClient } from './auth';
import { initializeApi } from './fetch';
import { getNewTokens } from './token';
import { log } from '@thecointech/logging';


export async function initialize(token?: string) {

  const { client, credentials } = await getAuth(token);
  if (!credentials || !client.credentials.access_token) {
    const summary = {
      hasCreds: Boolean(credentials),
      hasRefresh: Boolean((credentials as any)?.refresh_token),
      hasAccess: Boolean((credentials as any)?.access_token),
      expiry: (credentials as any)?.expiry_date,
    };
    log.fatal({ summary }, "Cannot run tx-gmail without valid auth");
    throw new Error("NoAuth");
  }

  await initializeApi(client);
  return JSON.stringify(credentials);
}

async function getAuth(token?: string) {
  const client = await getAuthClient();
  if (token) {
    const credentials = getCredentials(token);
    if (credentials) {
      client.setCredentials(credentials);
      // Validate 
      try {
        const refreshed = await client.refreshAccessToken();
        return { client, credentials: refreshed.credentials };
      }
      catch (err) {
        log.warn({ err }, "tx-gmail: failed to refresh token");
      }
    }
  }
  // Didn't work for whatever reason, try to get a new one
  log.info("tx-gmail: no valid credentials, getting new ones");
  const newCredentials = await getNewTokens(client);
  client.setCredentials(newCredentials);
  return { client, credentials: newCredentials };
}

function getCredentials(token?: string) {
  if (token) {
    try {
      const credentials = JSON.parse(token);
      if (!credentials || (typeof credentials !== 'object')) return null;

      // Always pass in development/testing
      if (process.env.CONFIG_NAME === "development" || process.env.CONFIG_NAME === "devlive") {
        return {
          refresh_token: "",
          access_token: "token",
          expiry_date: 0,
        };
      }

      // Minimal shape check; avoid returning junk
      const hasRefresh = typeof credentials.refresh_token === 'string' && credentials.refresh_token.length > 0;
      const hasAccess = typeof credentials.access_token === 'string' && credentials.access_token.length > 0;
      if (!hasRefresh && !hasAccess) {
        log.error({ credentials }, "tx-gmail: invalid credentials shape");
        return null;
      }

      return credentials;
    } catch (err) {
      log.warn({ err }, "tx-gmail: invalid token JSON");
      return null;
    }
  }
  return null;
}
