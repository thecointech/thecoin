import { shell } from 'electron';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

import credentials from './credentials.json';
import { ConfigStore } from 'store/config';

// If modifying these scopes, delete token.json.
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.modify',
];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.

const TOKEN_KEY = "token.json";

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
export async function authorize() {
  const { client_secret, client_id, redirect_uris } = credentials.installed
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  const existing = await ConfigStore.get(TOKEN_KEY);
  if (existing) {
    oAuth2Client.setCredentials(JSON.parse(existing));
  }
  else {
    await getNewToken(oAuth2Client);
  }
  return oAuth2Client
}

export function isValid(oAuth2Client: OAuth2Client) {
  return !!oAuth2Client?.credentials?.access_token;
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
async function getNewToken(oAuth2Client: OAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  shell.openExternal(authUrl);
}

export async function finishLogin(oAuth2Client: OAuth2Client, code: string) {
  if (oAuth2Client.credentials.access_token)
  {
    // TODO: timeout?
  }
  else
  {
    var response = await oAuth2Client.getToken(code)
    await ConfigStore.set(TOKEN_KEY, JSON.stringify(response.tokens))
    oAuth2Client.setCredentials(response.tokens);  
  }
}