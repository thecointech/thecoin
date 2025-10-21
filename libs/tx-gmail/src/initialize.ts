import { getAuthClient, isValid } from './auth';
import { initializeApi } from './fetch';
import { getNewTokens } from './token';
import { log } from '@thecointech/logging';


export async function initialize(token?: string) {
  const auth = await getAuthClient();
  const credentials = getCredentials(token) ?? await getNewTokens(auth);
  auth.setCredentials(credentials);
  if (!credentials || !isValid(auth)) {
    const summary = {
      hasCreds: Boolean(credentials),
      hasRefresh: Boolean((credentials as any)?.refresh_token),
      hasAccess: Boolean((credentials as any)?.access_token),
      expiry: (credentials as any)?.expiry_date,
    };
    log.fatal({ summary }, "Cannot run tx-gmail without valid auth");
    throw new Error("NoAuth");
  }

  await initializeApi(auth);
  return JSON.stringify(credentials);
}

function getCredentials(token?: string) {
  if (token) {
    try {
      const credentials = JSON.parse(token);
      if (!credentials || (typeof credentials !== 'object')) return null;
      // Minimal shape check; avoid returning junk
      if (!('refresh_token' in credentials) && !('access_token' in credentials)) return null;
      return credentials;
    } catch (err) {
      log.warn({ err }, "initialize: invalid token JSON");
      return null;
    }

    // const credentials =  JSON.parse(token);
    // return credentials;
    // if (credentials.expiry_date > Date.now()) {
    //   return credentials;
    // }
    // else {
    //   log.warn("Token expired, requesting new token");
    // }
  }
  return null;
}
