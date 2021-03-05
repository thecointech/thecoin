import { google, drive_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import credentials from './gdrive_cred.json'
import { GoogleFileIdent, GoogleStoreAccount, GoogleToken, GoogleWalletItem } from '@the-coin/types';

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive.appdata'];
const AUTH_REDIR_IDX = process.env.NODE_ENV === 'development' ? 0 : 1;

function  buildAuth()
{
  const {client_secret, client_id, redirect_uris} = credentials.web;
  return new OAuth2Client(client_id, client_secret, redirect_uris[AUTH_REDIR_IDX]);
}

async function loginDrive(authToken: GoogleToken)
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


export async function storeOnGoogle(account: GoogleStoreAccount) {
  const {walletName, wallet, token } = account;
  if (!walletName || !wallet)
    throw new Error("Missing data from gdrive save");

  // Throw if wallet is not valid JSON
  const walletObject = JSON.parse(wallet);
  console.log(`Storing wallet for user: ${walletObject.address}`)
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

export async function listWallets(token: GoogleToken) : Promise<GoogleFileIdent[]>
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

export async function fetchWallets(request: GoogleToken) : Promise<GoogleWalletItem[]>
{
  const drive = await loginDrive(request);
  const wallets = await doListWallets(drive);
  const fetchArray = wallets.map(async (file) => {

    const get: drive_v3.Params$Resource$Files$Get = {
      fileId: file.id ?? undefined,
      alt: 'media',
    }
    const r = await drive.files.get(get, {responseType: 'json'});

    return <GoogleWalletItem>{
        id: {
          id: file.id!,
          name: file.originalFilename || file.name,
          type: "pwd" // Means it's protected by a password...
        },
        wallet: (r.status == 200)
          ? r.data
          : `{ "error": "Error Fetching" }`
      }
  })

  const all = Promise.all(fetchArray);
  return all;
}
