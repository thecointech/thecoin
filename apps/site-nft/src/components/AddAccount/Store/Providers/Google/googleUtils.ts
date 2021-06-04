import { log } from "@thecointech/logging";
import { GetSecureApi } from "api";

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
    const gauth = await secureApi.googleAuthUrl();
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

export function doSetup(setAuthUrl: (url: string) => void, setState: (state: UploadState) => void) {

  let isCancelled = false;
  const cancel = () => { isCancelled = true; }

  fetchGAuthUrl()
    .then(url => {
      // Allow cancelling (eg - navigating away from page)
      if (isCancelled)
        return;
      if (url) {
        setAuthUrl(url);
        setState(UploadState.Ready);
      }
      else {
        setState(UploadState.Invalid);
      }
    })
    .catch(err => {
      log.error(err);
      setState(UploadState.Invalid);
    })
  return cancel;
}


export type AuthCallback = (token: string) => Promise<void>;

export function onInitiateLogin(gauthUrl: string) {
  // First, setup the callback
  //setupCallback(callback);

  // Next trigger opening
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
  completeGauthLogin?: AuthCallback
}
//
// Setup the callback called by our opened auth window
export function setupCallback(callback: AuthCallback) {
  const myWindow: IWindow = window;
  myWindow.completeGauthLogin = callback;
}

export function clearCallback() {
  const myWindow: IWindow = window;
  myWindow.completeGauthLogin = undefined
}

// waitGauthLogin = async (gauthWindow: IWindow) => {

//   const myWindow : IWindow = window;
//   var timer = setInterval(function() {
//     if(gauthWindow.closed) {
//         clearInterval(timer);
//         // Check, did we get our cookie?
//         const cookieVal = getCookie('gauth')
//         if (cookieVal)
//           myWindow.completeGauthLogin!(cookieVal)
//     }
//   }, 1000);
//   this.setState({timer})
// }

// clearWaitingTimer = () => {
//   // Cancel the timer (if it's running)
//   const { timer } = this.state;
//   if (timer) {
//     clearInterval(timer)
//     this.setState({timer: 0})
//   }
// }

// tryCompleteCookie = () => {
//   // TODO: Support instances where
//   // we were forced to use location = gauth
//   // instead of opening a new brower.
// }
