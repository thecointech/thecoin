import { google, drive_v3 } from 'googleapis';
import { GoogleFileIdent, GoogleStoreAccount, GoogleToken, GoogleWalletItem } from '@thecointech/types';
import { log } from '@thecointech/logging';
import { getGoogleSecret } from '@thecointech/secrets-google';

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive.appdata'];
const buildAuth = async (clientUri: string) => {
  if (!process.env.BROKER_GDRIVE_CLIENT_URIS?.split(';').includes(clientUri)) {
    log.error({ Uri: clientUri }, 'Invalid ClientURI passed: {Uri}')
    throw new Error('Cannot Login to GDrive');
  }

  const clientID = await getGoogleSecret('BrokerGDriveClientId');
  const clientSecret = await getGoogleSecret('BrokerGDriveClientSecret');
  return new google.auth.OAuth2(
    clientID,
    clientSecret,
    clientUri
  );
}

async function loginDrive(clientUri: string, authToken: GoogleToken) {
  const auth = await buildAuth(clientUri);
  const res = await auth.getToken(authToken.token);
  if (!res || !res.tokens) {
    throw new Error("Could not retrieve token: " + JSON.stringify(res));
  }
  auth.setCredentials(res.tokens);
  return google.drive({ version: 'v3', auth });
}

export async function getAuthUrl(clientUri: string) {
  const auth = await buildAuth(clientUri);
  return auth.generateAuthUrl({
    access_type: 'online',
    scope: SCOPES,
  });
}


export async function storeOnGoogle(clientUri: string, account: GoogleStoreAccount) {
  const { walletName, wallet, token } = account;
  if (!walletName || !wallet)
    throw new Error("Missing data from gdrive save");

  // Throw if wallet is not valid JSON
  const walletObject = JSON.parse(wallet);
  console.log(`Storing wallet for user: ${walletObject.address}`)
  const drive = await loginDrive(clientUri, token);

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

export async function listWallets(clientUri: string, token: GoogleToken): Promise<GoogleFileIdent[]> {
  const drive = await loginDrive(clientUri, token);
  const wallets = await doListWallets(drive);
  return wallets.map(file => ({
    name: file.originalFilename || file.name || "<err>",
    id: file.id || "<err>"
  }));
}

export async function doListWallets(drive: drive_v3.Drive): Promise<drive_v3.Schema$File[]> {
  const params: drive_v3.Params$Resource$Files$List = {
    spaces: 'appDataFolder',
  }
  const r = await drive.files.list(params);
  return (r && r.data && r.data.files) ?
    r.data.files :
    [];
}

export async function fetchWallets(clientUri: string, request: GoogleToken): Promise<GoogleWalletItem[]> {
  const drive = await loginDrive(clientUri, request);
  const wallets = await doListWallets(drive);
  const fetchArray = wallets.map(async (file) => {

    const get: drive_v3.Params$Resource$Files$Get = {
      fileId: file.id ?? undefined,
      alt: 'media',
    }
    const r = await drive.files.get(get, { responseType: 'text' });
    log.debug(`Fetched wallet: ${r.statusText} - ${JSON.parse(r.data as string).address}`);

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


