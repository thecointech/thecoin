
import { getAuthUrl, storeOnGoogle } from '../secure/gdrive'
import { BrokerCAD } from "@the-coin/types";

/**
 * Get the authorization URL to redirect the user to
 *
 * no response value expected for this operation
 **/
export async function googleAuthUrl() {
  try {
    return getAuthUrl();
  }
  catch (err) {
    console.error(err);
    throw new Error("Server Error")
  }
}


/**
 * Retrieve from google drive
 *
 * token  
 * no response value expected for this operation
 **/
export async function googleRetrieve(token) {
  return new Promise(function(resolve, reject) {
    resolve();
  });
}


/**
 * Store on  google drive
 *
 * account GoogleUploadPacket 
 * no response value expected for this operation
 **/
export async function googleStore(account: BrokerCAD.GoogleUploadPacket) {
  try {
    return storeOnGoogle(account);
  }
  catch (err) {
    console.error(err);
    throw new Error("Server Error")
  }
}

