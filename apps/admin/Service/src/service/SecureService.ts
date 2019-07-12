
import { getAuthUrl, storeOnGoogle, listWallets, fetchWallets } from '../Secure/gdrive'
import { BrokerCAD } from "@the-coin/types";

/**
 * Get the authorization URL to redirect the user to
 *
 * returns GoogleAuthUrl
 **/
export async function googleAuthUrl() : Promise<BrokerCAD.GoogleAuthUrl> {
  try {
    const url = getAuthUrl();
    return {url};
  }
  catch (err) {
    console.error(err);
    throw new Error("Server Error")
  }
}

/**
 * Get the listing of available accounts
 *
 * token GoogleToken 
 * returns GoogleListResult
 **/
export async function googleList(token: BrokerCAD.GoogleToken): Promise<BrokerCAD.GoogleListResult> {
  try {
    const wallets = await listWallets(token);
    return {wallets};
  }
  catch (err) {
    console.error(err);
    throw new Error("Server Error")
  }
}

/**
 * Store on  google drive
 *
 * account GoogleUploadPacket 
 * no response value expected for this operation
 **/
export async function googlePut(account: BrokerCAD.GooglePutRequest): Promise<boolean> {
  try {
    const result = await storeOnGoogle(account);
    return result;
  }
  catch (err) {
    console.error(err);
    throw new Error("Server Error")
  }
}


/**
 * Retrieve previously-stored file from google drive
 *
 * token GoogleToken 
 * returns GoogleGetResult
 **/
export async function googleRetrieve(request: BrokerCAD.GoogleToken) : Promise<BrokerCAD.GoogleGetResult> {
  try {
    const wallets = await fetchWallets(request);
    return {wallets};
  }
  catch (err) {
    console.error(err);
    throw new Error("Server Error")
  }
}

