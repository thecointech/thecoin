import * as React from 'react';
import { Wallet } from 'ethers';
import { FormattedMessage } from 'react-intl';
import { Redirect } from 'react-router';
import { Button, Form, Header } from 'semantic-ui-react';

import { UxPassword } from 'components/UxPassword';
import { ModalOperation } from 'containers/ModalOperation';
import messages from './messages';

type decryptCallback = (percent: number) => boolean;
type decryptFunction = (password: string, callback: decryptCallback) => void;

interface OwnProps {
  walletName: string,
  wallet: Wallet,
  decrypt: decryptFunction
}
type Props = OwnProps;

enum LoginState {
  Entry,
  Decrypting,
  Failed,
  Cancelled,
  Complete
}

const initialState = {
  password: '',
  percentComplete: 0,
  cancelDecrypting: false,
  state: LoginState.Entry,
};

type State = Readonly<typeof initialState>;

class Login extends React.PureComponent<Props, State, null> {
  state = initialState;

  constructor(props: Props) {
    super(props);

    this.onPasswordChange = this.onPasswordChange.bind(this);
    this.decryptWallet = this.decryptWallet.bind(this);
    this.decryptWalletCallback = this.decryptWalletCallback.bind(this);
    this.onCancelLogin = this.onCancelLogin.bind(this);
  }

  onPasswordChange(value: string): void {
    this.setState({
      password: value,
    });
    // If we are in a failed state, reset state with new keystroke
    const { state } = this.state;
    if (state == LoginState.Cancelled || state == LoginState.Failed) {
      this.setState({
        state: LoginState.Entry
      })
    }
  }

  decryptWalletCallback(percent: number): boolean {
    if (this.state.cancelDecrypting) {
      this.setState({
        state: LoginState.Cancelled,
        cancelDecrypting: false
      })
      return false;
    }
    else if (percent == -1) {
      // Invalid password?
      if (!this.state.cancelDecrypting) {
        this.setState({
          state: LoginState.Failed,
        })
      }
      return false;
    }
    else if (percent == 100) {
      this.setState({
        state: LoginState.Complete,
        cancelDecrypting: false,
      })
    }
    else {
      this.setState({
        percentComplete: percent,
      })
    }
    return true;
  }

  onCancelLogin() {
    this.setState({
      cancelDecrypting: true
    });
  }

  decryptWallet(e: React.MouseEvent<HTMLElement>) {
    if (e) e.preventDefault();

    const { wallet, walletName } = this.props;
    const { password } = this.state;

    if (wallet.privateKey) {
      throw (`Cannot decrypt ${walletName} because it is already decrypted`);
    }

    this.setState({
      state: LoginState.Decrypting
    })

    this.props.decrypt(password, this.decryptWalletCallback);
  }

  getMessage(state: LoginState)
  {
    switch(state) 
    {
      case LoginState.Cancelled:
        return messages.decryptCancelled
      case LoginState.Failed:
        return messages.decryptIncorrectPwd
    }
    return undefined;
  }

  render() {

    const { wallet, walletName } = this.props;
    if (wallet && wallet.privateKey) {
        return <Redirect to={`/accounts/${walletName}`} />;
    }
    const {state} = this.state;

    const isDecrypting = state == LoginState.Decrypting;
    const showState = state == LoginState.Decrypting || state == LoginState.Cancelled || state == LoginState.Failed;
    const isValid = !(state == LoginState.Cancelled || state == LoginState.Failed);
    const message = this.getMessage(state);

    return (
      <React.Fragment>
        <Form>
          <Header as="h1">
            <Header.Content>
              <FormattedMessage {...messages.header}
                values={{
                  walletName: this.props.walletName
                }}
              />
            </Header.Content>
            <Header.Subheader>
              <FormattedMessage {...messages.subHeader} />
            </Header.Subheader>
          </Header>
          <UxPassword
            uxChange={this.onPasswordChange}
            intlLabel={messages.labelPassword}
            placeholder="Wallet Password"
            message={message}
            isValid={isValid}
            forceValidate={showState}
          />
          <Button onClick={this.decryptWallet}>
            <FormattedMessage {...messages.buttonLogin} />
          </Button>
        </Form>
        <ModalOperation cancelCallback={this.onCancelLogin} isOpen={isDecrypting} header={messages.decryptHeader} progressMessage={messages.decryptInProgress} progressPercent={this.state.percentComplete} />
      </React.Fragment>
    );
  }
}

export { Login }