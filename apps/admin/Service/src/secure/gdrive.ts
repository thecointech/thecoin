import fs from 'fs';
import readline from 'readline';
//import {google} from 'googleapis';
import { drive_v3, google } from 'googleapis/build/src/';
import { OAuth2Client } from 'google-auth-library';

import credentials from './gdrive_cred.json'
import { BrokerCAD } from '@the-coin/types';

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive.appdata'];


function  buildAuth()
{
  const {client_secret, client_id, redirect_uris} = credentials.web;
  return new OAuth2Client(client_id, client_secret, redirect_uris[0]);
}

async function loginDrive(authToken: BrokerCAD.GoogleToken)
{
  const auth = buildAuth();
  const res = await auth.getToken(authToken.token);
  if (!res || !res.tokens) {
    throw new Error("Could not retrieve token: " + JSON.stringify(res));
  }
  auth.setCredentials(res.tokens);
  return google.drive({version: 'v3', auth});
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

  const drive = await loginDrive(token);
  
  var fileMetadata = {
    name: walletName + ".wallet",
    originalFilename: walletName,
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

export async function listWallets(token: BrokerCAD.GoogleToken) : Promise<BrokerCAD.GoogleFileIdent[]>
{
  const drive = await loginDrive(token);
  const wallets = await doListWallets(drive);
  return wallets.map(file => ({
      name: file.originalFilename || file.name || "<err>",
      id: file.id || "<err>"
    }));
}

export async function doListWallets(drive: drive_v3.Drive) : Promise<drive_v3.Schema$File[]>
{
  const params: drive_v3.Params$Resource$Files$List = {
    spaces: 'appDataFolder',
  }
  const r = await drive.files.list(params);
  return (r && r.data && r.data.files) ?
    r.data.files :
    [];
}

const Buffer2Str = (buff: ArrayBuffer) =>
  String.fromCharCode.apply(null, new Uint8Array(buff));

export async function fetchWallets(request: BrokerCAD.GoogleToken) : Promise<BrokerCAD.GoogleWalletItem[]>
{
  const drive = await loginDrive(request);
  const wallets = await doListWallets(drive);
  const fetchArray = wallets.map(async (file) => {
    const r = await drive.files.get({
      fileId: file.id,
      alt: 'media',
    }, {responseType: 'arraybuffer'});

    return <BrokerCAD.GoogleWalletItem>{
        id: {
          id: file.id!,
          name: file.originalFilename || file.name,
          type: "pwd" // Means it's protected by a password...
        },
        wallet: (r.status == 200) ? 
                  Buffer2Str(r.data as ArrayBuffer) : 
                  `{ "error": "Error Fetching" }`
      }
  })

  const all = Promise.all(fetchArray);
  return all;
}