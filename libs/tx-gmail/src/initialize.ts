import { getAuthClient, isValid } from './auth';
import { initializeApi } from './fetch';
import { getNewTokens } from './token';
import { log } from '@thecointech/logging';


export async function initialize(token?: string) {
  const auth = await getAuthClient();
  const credentials = getCredentials(token) ?? await getNewTokens(auth);
  auth.setCredentials(credentials);
  if (!credentials || !isValid(auth)) {
    log.fatal(`Cannot run tx-gmail without auth: credentials ${JSON.stringify(credentials)}`)
    throw new Error("NoAuth");
  }

  await initializeApi(auth);
  return JSON.stringify(credentials);
}

function getCredentials(token?: string) {
  if (token) {
    const credentials =  JSON.parse(token);
    return credentials;
    // if (credentials.expiry_date > Date.now()) {
    //   return credentials;
    // }
    // else {
    //   log.warn("Token expired, requesting new token");
    // }
  }
  return null;
}
