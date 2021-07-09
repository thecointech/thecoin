import React, { useState, useEffect, useCallback } from 'react';
import { Header, Grid } from 'semantic-ui-react';
import { GoogleWalletItem } from '@thecointech/types';
import { FormattedMessage } from 'react-intl';
import { GetSecureApi, clientUri } from '../../../../api';
import { AccountList } from './AccountList';
import { ConnectButton } from './ConnectButton';
import { onInitiateLogin, clearCallback, setupCallback, UploadState, doSetup } from '../GDrive/googleUtils';

import google from "../images/google.svg";
import microsoft from "../images/microsoft.svg";
import dropbox from "../images/dropbox.svg";

import styles from './styles.module.less';
import sharedStyles from '../styles.module.less';
import { Link } from 'react-router-dom';
import { Decoration } from '../../Decoration';
import { ButtonPrimary } from '../../../../components/Buttons';
import { AvailableSoon } from '@thecointech/shared/containers/Widgets/AvailableSoon';
import { ProviderChoice } from '../ProviderChoice';
import { OfflineRestore } from '../Offline/Restore';

const aboveTheTitle = { id:"app.account.restore.aboveTheTitle",
                        defaultMessage:"Restore Account",
                        description:"The above the title text for the restore account page"};
const title = { id:"app.account.restore.title",
                defaultMessage:"Welcome back to TheCoin!",
                description:"The main title for the restore account page"};

const googleLink = { id:"app.account.restore.google",
                        defaultMessage:"Restore from Google",
                        description:"Microsoft link for the restore your account page"};
const microsoftLink = { id:"app.account.restore.microsoft",
                        defaultMessage:"Restore from Microsoft OneDrive",
                        description:"Microsoft link for the restore your account page"};
const dropboxLink = { id:"app.account.restore.dropbox",
                      defaultMessage:"Restore from Dropbox",
                      description:"Dropbox link for the restore your account page"};
const otherEthereum = { id:"app.account.restore.otherEthereum.explanation",
                        defaultMessage:"Also you can log into your account using an existing Ethereum account.",
                        description:"The link to redirect to use your existing ethereum for the restore your account page"};
const restoreHelp = { id:"app.account.restore.help",
                      defaultMessage:"If you have any problems with restoring your account, contact us for help.",
                      description:"The text before the button to redirect to the create an account page for the restore your account page"};
const explanation = { id:"app.account.restore.createAccount.explanation",
                      defaultMessage:"Don’t have an account?",
                      description:"The text before the button to redirect to the create an account page for the restore your account page"};
const buttonCreateAccount = { id:"app.account.restore.button.createAccount",
                              defaultMessage:"Create Account",
                              description:"The button to redirect to the create an account page for the restore your account page"};

export const Restore = () => {

  const [state, setState] = useState(UploadState.Waiting);
  const [gauthUrl, setAuthUrl] = useState(undefined as MaybeString);
  const [wallets, setWallets] = useState([] as GoogleWalletItem[]);

  /////////////////////////////////////////
  // We create a callback to this component, and assign to window
  // This allows our popup to communicate back with us
  const completeCallback = useCallback(async (token: string) => {

    clearCallback();
    const wallets = await fetchStoredWallets(token)
    if (!wallets) {
      alert('Fetching Wallets Failed - please contact support')
    }
    else {
      setWallets(wallets);
    }
  }, [setWallets]);
  useEffect(() => { setupCallback(completeCallback) }, [completeCallback])

  /////////////////////////////////////////
  // We ask the server for the URL we use to request the login code
  useEffect(
    () => doSetup(setAuthUrl, setState),
    [setAuthUrl, setState]
  );

  /////////////////////////////////////////
  const onConnectClick = () => onInitiateLogin(gauthUrl!);

  /////////////////////////////////////////

  const loading = state === UploadState.Waiting
    || state === UploadState.Uploading;
  const disabled = state === UploadState.Invalid
    || state === UploadState.Complete;

  return (
    <div className={styles.content}>
      <Header as="h5" className={`x8spaceBefore`}>
          <FormattedMessage {...aboveTheTitle} />
      </Header>
      <Header as="h2" className={`x8spaceAfter`}>
          <FormattedMessage {...title} />
      </Header>

      <Grid stackable columns={4} id={sharedStyles.choices}>
        <Grid.Row>
          <Grid.Column>
            <OfflineRestore />
          </Grid.Column>
          <Grid.Column>
          <ProviderChoice link={"/addAccount/upload"} txt={googleLink} imgSrc={google} />
            <ConnectButton onClick={onConnectClick} disabled={disabled} loading={loading} isVisible={!wallets.length} >
              <img src={ google } />
              <Header as={"h4"}><FormattedMessage {...googleLink} /></Header>
              <AccountList wallets={wallets} />
            </ConnectButton>
          </Grid.Column>
          <Grid.Column>
            <AvailableSoon>
              <div className={sharedStyles.soon}>
                <a className={"x8spaceAfter"}>
                  <img src={ microsoft } />
                  <Header as={"h4"}><FormattedMessage {...microsoftLink} /></Header>
                </a>
              </div>
            </AvailableSoon>
          </Grid.Column>
          <Grid.Column>
            <AvailableSoon>
              <div className={sharedStyles.soon}>
                <a className={"x8spaceAfter"}>
                  <img src={ dropbox } />
                  <Header as={"h4"}><FormattedMessage {...dropboxLink} /></Header>
                </a>
              </div>
            </AvailableSoon>
          </Grid.Column>
        </Grid.Row>
      </Grid>
      <div className={ `x8spaceBefore` }>
        <b>
        <FormattedMessage {...otherEthereum} />
        </b>
      </div>
      <div className={ `x4spaceBefore x8spaceBefore` }>
        <FormattedMessage {...restoreHelp} />
      </div>
      <div className={styles.createAccountContent} >
          <FormattedMessage {...explanation} />
          &nbsp;&nbsp;&nbsp;&nbsp;
          <ButtonPrimary as={Link} to="/addAccount" size='medium' >
            <FormattedMessage {...buttonCreateAccount} />
          </ButtonPrimary>
        </div>
        <Decoration />
    </div>
  );
}

// function onInitiateLogin(gauthUrl: string) {
//   // First, setup the callback
//   //setupCallback();

//   // Next trigger opening
//   const gauthWindow = window.open(gauthUrl, name);
//   if (gauthWindow) {
//     //setWindow(gauthWindow);
//     //this.waitGauthLogin(gauthWindow);
//   } else {
//     // TODO: verify non-popup flow
//     window.location.assign(gauthUrl);
//   }
// };

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
    const wallets = await secureApi.googleRetrieve(clientUri, { token });
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


// async function fetchGAuthUrl(setUrl: (url: string) => void) {
//   try {
//     const secureApi = GetSecureApi();
//     const gauth = await secureApi.googleAuthUrl();
//     if (gauth?.data?.url) {
//       setUrl(gauth.data.url);
//     }
//     else {
//       throw new Error('Oh No, wtf: ' + JSON.stringify(gauth));
//     }
//   } catch (err) {
//     console.error(JSON.stringify(err));
//     alert('Could not setup Google Login');
//   }
//   return false;
// }

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

