import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
export function getAuthClient() {
  const oAuth2Client = new google.auth.OAuth2(
    process.env.TX_GMAIL_CLIENT_ID,
    process.env.TX_GMAIL_CLIENT_SECRET,
    process.env.TX_GMAIL_CLIENT_URI,
  );

  return oAuth2Client
}

export function isValid(oAuth2Client: OAuth2Client|null) {
  return !!oAuth2Client?.credentials?.access_token;
}
