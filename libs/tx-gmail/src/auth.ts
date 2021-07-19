import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { ConfigStore } from '@thecointech/store';

// If modifying these scopes, delete token.json.
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.modify',
];

// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first time.
const TOKEN_STORE = "token.json";

// Callback to trigger fetching a new auth token
export type OpenUrl = (url: string) => Promise<string>;

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
export async function authorize(openurl?: OpenUrl) {
  const oAuth2Client = new google.auth.OAuth2(
    process.env.TX_GMAIL_CLIENT_ID,
    process.env.TX_GMAIL_CLIENT_SECRET,
    process.env.TX_GMAIL_CLIENT_URI,
  );

  // Check if we have previously stored a token.
  // This value is mutable (so cannot be in an env variable)
  let token = await ConfigStore.get(TOKEN_STORE);
  if (!token && openurl) {
    const code = await getNewToken(oAuth2Client, openurl);
    const response = await oAuth2Client.getToken(code);
    token = JSON.stringify(response.tokens)
    await ConfigStore.set(TOKEN_STORE, token)
  }

  if (token) {
    oAuth2Client.setCredentials(JSON.parse(token));
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

  return await openurl(authUrl);
}
