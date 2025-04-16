import { google } from 'googleapis';
import type { OAuth2Client } from 'google-auth-library';
import { getAuthConfig } from './authConfig';

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
export async function getAuthClient() {
  const credentials = await getAuthConfig();
  const oAuth2Client = new google.auth.OAuth2(
    credentials.Id,
    credentials.Secret,
    credentials.Uri,
  );

  return oAuth2Client
}

export function isValid(oAuth2Client: OAuth2Client|null) {
  return !!oAuth2Client?.credentials?.access_token;
}

