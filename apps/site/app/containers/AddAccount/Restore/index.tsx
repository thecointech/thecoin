import { GetSecureApi } from 'containers/Services/BrokerCAD';
import React from 'react';
import { Button, Form, Header, List, Divider } from 'semantic-ui-react';
import { IWindow } from '../../Accounts/Settings/gconnect/gauth';
import { AccountMap } from '@the-coin/shared/containers/Account/types';
import { BrokerCAD } from '@the-coin/types/src/BrokerCAD';
import { injectSingleAccountReducer } from '@the-coin/shared/containers/Account/reducer';
import { connect } from 'react-redux';
import { structuredSelectAccounts } from '@the-coin/shared/containers/Account/selector';
import {
  buildMapDispatchToProps,
  DispatchProps,
} from '@the-coin/shared/containers/Account/actions';
import { FormattedMessage } from 'react-intl';
import messages from './messages';
import { ExistsSwitcher } from '../ExistsSwitcher';

// Given a cookie key `name`, returns the value of
// the cookie or `null`, if the key is not found.
function getCookie(name: string) {
  const value = '; ' + document.cookie;
  const parts = value.split('; ' + name + '=');
  return parts.length === 2
    ? decodeURI(
        parts
          .pop()!
          .split(';')
          .shift()!,
      )
    : '';
}

type Props = {
  accounts: AccountMap;
} & DispatchProps;

const initialState = {
  gauthUrl: '',
  gauthWindow: null as IWindow | null,
  timer: undefined as any,
  wallets: null as null | BrokerCAD.GoogleWalletItem[],
  token: '',
};

export class RestoreClass extends React.PureComponent<Props> {
  state = initialState;

  async componentWillMount() {
    // Ensure we don't have any unknown callbacks hanging about
    this.clearCallback();
    await this.fetchGAuthUrl();
  }

  componentWillUnmount() {
    this.clearWaitingTimer();
  }

  async fetchGAuthUrl() {
    try {
      const secureApi = GetSecureApi();
      const gauth = await secureApi.googleAuthUrl();
      if (gauth && gauth.url) {
        this.setState({ gauthUrl: gauth.url });
        return gauth.url;
      } else throw new Error('Oh No, wtf: ' + JSON.stringify(gauth));
    } catch (err) {
      console.error(JSON.stringify(err));
      alert('Could not setup Google Login');
    }
    return '';
  }

  //
  // Setup the callback called by our opened auth window
  setupCallback() {
    const myWindow: IWindow = window;
    myWindow.completeGauthLogin = this.completeGauthLogin;
  }

  clearCallback() {
    const myWindow: IWindow = window;
    myWindow.completeGauthLogin = undefined;
  }

  onInitiateLogin = e => {
    e.preventDefault();

    const { gauthUrl } = this.state;
    // First, setup the callback
    this.setupCallback();

    // Next trigger opening
    const gauthWindow = window.open(gauthUrl, name);
    if (gauthWindow) {
      this.setState({ gauthWindow });
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

  waitGauthLogin = async (gauthWindow: IWindow) => {
    const myWindow: IWindow = window;
    var timer = setInterval(() => {
      if (gauthWindow.closed) {
        clearInterval(timer);
        // Check, did we get our cookie?
        const cookieVal = getCookie('gauth');
        if (cookieVal) myWindow.completeGauthLogin!(cookieVal);
      }
    }, 1000);
    this.setState({ timer });
  };

  clearWaitingTimer = () => {
    // Cancel the timer (if it's running)
    const { timer } = this.state;
    if (timer) {
      clearInterval(timer);
      this.setState({ timer: 0 });
    }
  };

  tryCompleteCookie = () => {
    // TODO: Support instances where
    // we were forced to use location = gauth
    // instead of opening a new brower.
  };

  completeGauthLogin = async (token: string) => {
    this.clearWaitingTimer();
    this.clearCallback();

    // Prematurely disable the account,
    // because for some reason we aren't
    // getting the callbacks triggered below
    this.setState({
      gauthUrl: '',
      token,
    });

    // Retrieve all wallets stored on this account
    // This is because we do not store the token anywhere -
    // that means it's a single-use token and we can't list/select/read
    try {
      const secureApi = GetSecureApi();
      const wallets = await secureApi.googleRetrieve({
        token: this.state.token,
      });
      this.setState(wallets);
    } catch (err) {
      console.error(err);
      alert(`Connection not established.  Check sushi for possible pathogens`);
    }
  };

  onRestore = async (id: string) => {
    // We simply push the account into LS
    const { wallets } = this.state;
    if (!wallets) {
      console.error('No wallets found: critical failure');
      return;
    }
    const wallet = wallets.find(w => w.id.id == id);
    if (!wallet || !wallet.wallet) {
      console.error('Wallet not found: critical failure');
      return;
    }
    // try and turn into a wallet
    const asJson = JSON.parse(wallet.wallet);
    this.props.setSigner(wallet.id.name!, asJson);
    // Remove wallet from list;
    // this.setState((prevState: State) => {
    // 	return {
    // 		wallets: prevState.wallets!.filter(wallet => wallet.id.id != id)
    // 	}
    // })
  };

  renderConnectButton = () => (
    <Form>
      <Button onClick={this.onInitiateLogin} disabled={!this.state.gauthUrl}>
        Restore from Google
      </Button>
    </Form>
  );

  renderAccounts = (wallets: BrokerCAD.GoogleWalletItem[]) =>
    wallets.map(wallet => {
      if (!wallet.wallet) return undefined;

      const { address } = JSON.parse(wallet.wallet);
      const keys = Object.keys(this.props.accounts);
      const alreadyLoaded = !!keys.find(
        key =>
          this.props.accounts[key].signer &&
          this.props.accounts[key].signer!.address == address,
      );
      const buttonText = alreadyLoaded ? 'Already Loaded' : 'Restore';
      return (
        <List.Item key={wallet.id.id}>
					<List.Content>
						{wallet.id.name}
						<Button
						disabled={alreadyLoaded}
						style={{float: "right"}}
            onClick={() => this.onRestore(wallet.id.id)}
          >{buttonText}</Button>
					</List.Content>
        </List.Item>
      );
    });

  renderAccountList = (wallets: BrokerCAD.GoogleWalletItem[]) => (
    <List divided relaxed>
      {this.renderAccounts(wallets)}
    </List>
  );

  renderContent() {
    const { wallets } = this.state;
    return wallets === null
      ? this.renderConnectButton()
      : this.renderAccountList(wallets);
  }

  render() {
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
        {this.renderContent()}
        <ExistsSwitcher filter="restore" />
      </div>
    );
  }
}

const key = '__@create|ee25b960';

// We need to ensure we have the Accounts reducer live
// so we add the reducer here.
export const Restore = injectSingleAccountReducer<{}>(key)(
  connect(
    structuredSelectAccounts,
    buildMapDispatchToProps(key),
  )(RestoreClass),
);
