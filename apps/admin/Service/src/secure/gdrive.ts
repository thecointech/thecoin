import fs from 'fs';
import readline from 'readline';
//import {google} from 'googleapis';
import { drive_v3, google } from 'googleapis/build/src/';
import { OAuth2Client } from 'google-auth-library';

import credentials from './gdrive_cred.json'
import { BrokerCAD } from '@the-coin/types';

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive.appdata'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
	
  // Authorize a client with credentials, then call the Google Drive API.
//authorize(listFiles);

function  buildAuth()
{
  const {client_secret, client_id, redirect_uris} = credentials.web;
  return new OAuth2Client(client_id, client_secret, redirect_uris[0]);
}

async function loginAuth(authToken: string)
{
  const auth = buildAuth();
  const res = await auth.getToken(authToken);
  if (!res || !res.tokens) {
    throw new Error("Could not retrieve token: " + JSON.stringify(res));
  }
  auth.setCredentials(res.tokens);
  return auth;
}

export function getAuthUrl()
{
  const auth = buildAuth();
  return auth.generateAuthUrl({
    access_type: 'online',
    scope: SCOPES,
  });
}


export async function storeOnGoogle(account: BrokerCAD.GooglePutRequest) {
  const {walletName, wallet, token } = account;
  if (!walletName || ! wallet)
    throw new Error("Missing data from gdrive save");

  const auth = await loginAuth(token.token);
  // Now to the meat: 
  const drive = google.drive({version: 'v3', auth});

  var fileMetadata = {
    walletName,
    'parents': ['appDataFolder']
  };
  var media = {
    body: wallet,
  };
  
  var params: drive_v3.Params$Resource$Files$Create = {
    media,
    fields: 'id',
    requestBody: fileMetadata
  }
  const r = await drive.files.create(params)
  console.log(`Saving : ${walletName} - ${r.statusText}`);
  return r.status == 200;
}

// type getEventsCallback = (auth: OAuth2Client) => void;
// /**
//  * Create an OAuth2 client with the given credentials, and then execute the
//  * given callback function.
//  * @param {function} callback The callback to call with the authorized client.
//  */
// export async function authorize(callback: getEventsCallback) {
//   const {client_secret, client_id, redirect_uris} = credentials.web;
//   const oAuth2Client = new OAuth2Client(client_id, client_secret, redirect_uris[0]);

//   // Check if we have previously stored a token.
//   fs.readFile(TOKEN_PATH, (err, tokenBuffer) => {
// 		if (err) return getAccessToken(oAuth2Client, callback);
// 		const token = tokenBuffer.toString();
//     oAuth2Client.setCredentials(JSON.parse(token));
//     callback(oAuth2Client);
//   });
// }

// /**
//  * Get and store new token after prompting for user authorization, and then
//  * execute the given callback with the authorized OAuth2 client.
//  * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
//  * @param {getEventsCallback} callback The callback for the authorized client.
//  */
// function getAccessToken(oAuth2Client: OAuth2Client, callback: getEventsCallback) {
//   const authUrl = oAuth2Client.generateAuthUrl({
//     access_type: 'online',
//     scope: SCOPES,
//   });
//   console.log('Authorize this app by visiting this url:', authUrl);
//   const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout,
//   });
//   rl.question('Enter the code from that page here: ', (code) => {
//     rl.close();
//     oAuth2Client.getToken(code, (err, token) => {
//       if (err || !token) return console.error('Error retrieving access token', err);
//       oAuth2Client.setCredentials(token);
//       // Store the token to disk for later program executions
//       fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
//         if (err) return console.error(err);
//         console.log('Token stored to', TOKEN_PATH);
//       });
//       callback(oAuth2Client);
//     });
//   });
// }

// /**
//  * Lists the names and IDs of up to 10 files.
//  * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
//  */
// export function listFiles(auth: OAuth2Client) {
// 	const drive = new drive_v3.Drive({auth})
//   //const drive = google.drive({version: 'v3', auth});
//   drive.files.list({
//     pageSize: 10,
//     fields: 'nextPageToken, files(id, name)',
//   }, (err, res) => {
//     if (err || !res) return console.log('The API returned an error: ' + err);
//     const files = res.data.files;
//     if (files && files.length) {
//       console.log('Files:');
//       files.map((file) => {
//         console.log(`${file.name} (${file.id})`);
//       });
//     } else {
//       console.log('No files found.');
//     }
//   });
// }