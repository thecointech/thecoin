
import { getAuthUrl, storeOnGoogle } from '../secure/gdrive'
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
export async function googleList(token: BrokerCAD.GoogleToken) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "accounts" : [ "accounts", "accounts" ]
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

/**
 * Store on  google drive
 *
 * account GoogleUploadPacket 
 * no response value expected for this operation
 **/
export async function googlePut(account: BrokerCAD.GooglePutRequest) {
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
 * token GoogleGetRequest 
 * returns GoogleGetResult
 **/
export async function googleRetrieve(token: BrokerCAD.GoogleToken) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "wallet" : "wallet"
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

