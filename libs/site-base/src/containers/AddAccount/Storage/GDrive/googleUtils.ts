import { log } from "@thecointech/logging";
import { clientUri, GetSecureApi } from '../../../../api.js';
import { getStoredAccountData } from '@thecointech/account/store';
import { isLocal } from '@thecointech/signers';

export enum UploadState {
  Waiting,
  Ready,
  Invalid,
  Uploading,
  Failed,
  Complete,
}

export async function fetchGAuthUrl() {
  try {
    const secureApi = GetSecureApi();
    const gauth = await secureApi.googleAuthUrl(clientUri);
    if (gauth?.data?.url) {
      return gauth.data.url;
    }
    else {
      throw new Error('Oups: ' + JSON.stringify(gauth));
    }
  } catch (err) {
    console.error(JSON.stringify(err));
    alert('Could not setup Google Login');
  }
  return false;
}

export function doSetup(setAuthUrl: (url: string|null) => void) {

  let isCancelled = false;
  const cancel = () => { isCancelled = true; }

  fetchGAuthUrl()
    .then(url => {
      // Allow cancelling (eg - navigating away from page)
      if (isCancelled)
        return;
      if (url) {
        setAuthUrl(url);
      }
      else {
        setAuthUrl(null);
      }
    })
    .catch(err => {
      log.error(err);
      setAuthUrl(null);
    })
  return cancel;
}

export type AuthCallback = (token: string) => void|Promise<void>;

export function onInitiateLogin(gauthUrl: string) {
  // Open window to request token from Google
  const gauthWindow = window.open(gauthUrl);
  if (gauthWindow) {
    //setWindow(gauthWindow);
    //this.waitGauthLogin(gauthWindow);
  } else {
    // TODO: verify non-popup flow
    window.location.assign(gauthUrl);
  }
};


export interface IWindow extends Window {
  completeGauthLogin?: (token: string) => void;
}
//
// Setup the callback called by our opened auth window
export function setupCallback(callback: (token: string) => void) {
  const myWindow: IWindow = window;
  myWindow.completeGauthLogin = callback
}

export function clearCallback() {
  const myWindow: IWindow = window;
  myWindow.completeGauthLogin = undefined
}

function fetchAndVerifyWallet(address: string) {
  const account = getStoredAccountData(address);
  if (account == null) {
    alert("Could not find local account - if you are seeing this, contact support@thecoin.io");
    throw new Error("Could not find local account: " + address);
  }

  const wallet = account.signer;
  if (!isLocal(wallet)) {
    alert("Cannot upload this wallet: it is not a local account");
    throw new Error("Could not find local account: " + address);
  }
  else if (wallet.privateKey) {
    alert("Could upload decrypted wallet - if you are seeing this, contact support@thecoin.io");
    throw new Error("Cannot upload wallet with private key");
  }
  return { wallet, name: account.name };
}


export async function completeStore(token: string, address: string) {

  // Do not upload the decrypted wallet: instead
  // we read the wallet directly from LS and upload that
  // This is because we trust our (soon to be sandboxed) storage to have
  // the right account data, but we do not trust what's in-memory
  const secureApi = GetSecureApi();

  // This should succeed, all these checks should have happened already
  const {wallet,name} = fetchAndVerifyWallet(address);

  const request = {
    token: {
      token
    },
    wallet: JSON.stringify(wallet),
    walletName: name
  }

  const res = await secureApi.googlePut(clientUri, request);
  log.trace(`googlePut status: ${res.status}`);
  return res.status === 200 && res.data;
}
