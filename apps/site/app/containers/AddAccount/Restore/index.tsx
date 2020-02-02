import React, { useState, useEffect, useCallback } from 'react';
import { Header, Divider } from 'semantic-ui-react';
import { IWindow } from '../../StoreOnline/Google/gauth';
import { GoogleWalletItem } from '@the-coin/types';
import { FormattedMessage } from 'react-intl';
import messages from './messages';
import { ExistsSwitcher } from '../ExistsSwitcher';
import { GetSecureApi } from 'api';
import { AccountList } from './AccountList';
import { ConnectButton } from './ConnectButton';


export const Restore = () => {

  const [gauthUrl, setAuthUrl] = useState(undefined as MaybeString);
  const [wallets, setWallets] = useState([] as GoogleWalletItem[]);
  const myWindow: IWindow = window;

  // We ask the server for the URL we use to request the login code
  useEffect(() => {
    fetchGAuthUrl(setAuthUrl);

    // Don't leave this callback active
    //return () => myWindow.completeGauthLogin = undefined;
  }, [setAuthUrl]);

  // We create a callback to this component, and assign to window
  // This allows our popup to communicate back with us
  const completeCallback = useCallback(async (token: string) => {
    myWindow.completeGauthLogin = undefined;
    const wallets = await fetchStoredWallets(token)
    if (!wallets) {
      alert('Fetching Wallets Failed - please contact support')
    }
    else {
      setWallets(wallets);
    }
  }, [setWallets]);
  myWindow.completeGauthLogin = completeCallback;

  const onConnectClick = useCallback(() => {
    onInitiateLogin(gauthUrl!);
  }, [gauthUrl]);

  return (
    <div id="formCreateAccountStep1">
      <Header as="h1">
        <Header.Content>
          <FormattedMessage {...messages.header} />
        </Header.Content>
        <Header.Subheader>
          <FormattedMessage {...messages.subHeader} />
        </Header.Subheader>
      </Header>
      <Divider />
      <ConnectButton onClick={onConnectClick} disabled={!gauthUrl} isVisible={!wallets.length} />
      <AccountList wallets={wallets} />
      <ExistsSwitcher filter="restore" />
    </div>
  );
}

function onInitiateLogin(gauthUrl: string) {
  // First, setup the callback
  //setupCallback();

  // Next trigger opening
  const gauthWindow = window.open(gauthUrl, name);
  if (gauthWindow) {
    //setWindow(gauthWindow);
    //this.waitGauthLogin(gauthWindow);
  } else {
    // TODO: verify non-popup flow
    window.location.assign(gauthUrl);
  }
};

// setupGauthLogin = (gauthUrl) => {
// 	const button = document.getElementById(ButtonId);
// 	if (!button) {
// 		throw new Error('Could not find required document element');
// 	}
// 	button.onclick = (e) => {
// 		e.preventDefault();
// 		const gauthWindow = window.open(gauthUrl, name);
// 		if (gauthWindow) {
// 			this.setState({gauthWindow});
// 			this.waitGauthLogin(gauthWindow);
// 		}
// 	}
// }

// async function waitGauthLogin(gauthWindow: IWindow) {
//   const myWindow: IWindow = window;
//   var timer = setInterval(() => {
//     if (gauthWindow.closed) {
//       clearInterval(timer);
//       // Check, did we get our cookie?
//       const cookieVal = getCookie('gauth');
//       if (cookieVal) myWindow.completeGauthLogin!(cookieVal);
//     }
//   }, 1000);
//   this.setState({ timer });
// };

// tryCompleteCookie = () => {
//   // TODO: Support instances where
//   // we were forced to use location = gauth
//   // instead of opening a new brower.
// };

async function fetchStoredWallets(token: string) {
  //clearWaitingTimer();
  //clearCallback();

  // Retrieve all wallets stored on this account
  // This is because we do not store the token anywhere -
  // that means it's a single-use token and we can't list/select/read
  try {
    const secureApi = GetSecureApi();
    const wallets = await secureApi.googleRetrieve({token});
    return wallets.data.wallets;
  } catch (err) {
    console.error(err);
    alert(`Connection not established.  Check sushi for possible pathogens`);
  }
  return undefined;
};

// async function onRestore(id: string) {
//   // We simply push the account into LS
//   const { wallets } = this.state;
//   if (!wallets) {
//     console.error('No wallets found: critical failure');
//     return;
//   }
//   const wallet = wallets.find(w => w.id.id == id);
//   if (!wallet || !wallet.wallet) {
//     console.error('Wallet not found: critical failure');
//     return;
//   }
//   // try and turn into a wallet
//   const asJson = JSON.parse(wallet.wallet);
//   this.props.setSigner(wallet.id.name!, asJson);
//   // Remove wallet from list;
//   // this.setState((prevState: State) => {
//   // 	return {
//   // 		wallets: prevState.wallets!.filter(wallet => wallet.id.id != id)
//   // 	}
//   // })
// };


async function fetchGAuthUrl(setUrl: (url: string) => void) {
  try {
    const secureApi = GetSecureApi();
    const gauth = await secureApi.googleAuthUrl();
    if (gauth?.data?.url) {
      setUrl(gauth.data.url);
    } 
    else {
      throw new Error('Oh No, wtf: ' + JSON.stringify(gauth));
    }
  } catch (err) {
    console.error(JSON.stringify(err));
    alert('Could not setup Google Login');
  }
  return false;
}

//
// Setup the callback called by our opened auth window
// function setupCallback() {
//   const myWindow: IWindow = window;
//   myWindow.completeGauthLogin = completeGauthLogin;
// }

// function clearCallback() {
//   const myWindow: IWindow = window;
//   myWindow.completeGauthLogin = undefined;
// }

