import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { ConfigStore } from '@thecointech/store';
import { existsSync, readFileSync } from 'fs';

// If modifying these scopes, delete token.json.
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.modify',
];

// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first time.
const TOKEN_STORE = "token.json";

// Callback to trigger fetching a new auth token
export type OpenUrl = (url: string) => void;

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
export async function authorize(openurl?: OpenUrl) {
  const credentialsPath = process.env.GMAIL_CREDENTIALS_PATH;
  if (!credentialsPath || !existsSync(credentialsPath))
    throw new Error("Cannot authorize gmail without credentials");
  const credentials = JSON.parse(readFileSync(credentialsPath, "utf8"));
  const { client_secret, client_id, redirect_uris } = credentials.installed
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]
  );

  // Check if we have previously stored a token.
  // This value is mutable (so cannot be in an env variable)
  const existing = await ConfigStore.get(TOKEN_STORE);
  if (existing) {
    oAuth2Client.setCredentials(JSON.parse(existing));
  }
  else if (openurl) {
    await getNewToken(oAuth2Client, openurl);
  }
  return oAuth2Client
}

export function isValid(oAuth2Client: OAuth2Client|null) {
  return !!oAuth2Client?.credentials?.access_token;
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param oAuth2Client The OAuth2 client to get token for.
 */

async function getNewToken(oAuth2Client: OAuth2Client, openurl: OpenUrl) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  openurl(authUrl);
}

export async function finishLogin(oAuth2Client: OAuth2Client, code: string) {
  if (oAuth2Client.credentials.access_token)
  {
    // TODO: timeout?
  }
  else
  {
    const response = await oAuth2Client.getToken(code)
    await ConfigStore.set(TOKEN_STORE, JSON.stringify(response.tokens))
    oAuth2Client.setCredentials(response.tokens);
  }
}
