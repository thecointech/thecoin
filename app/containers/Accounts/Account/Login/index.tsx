import { UxPassword } from 'components/UxPassword';
import { CancellableOperationModal } from 'containers/CancellableOperationModal';
import { Wallet } from 'ethers';
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Redirect } from 'react-router';
import { compose } from 'redux';
import { Button, Form, Header } from 'semantic-ui-react';
import { DispatchProps, mapDispatchToProps } from '../actions';
import messages from './messages';


interface OwnProps {
  accountName: string,
  account: Wallet
}
type Props = OwnProps & DispatchProps;

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

class LoginClass extends React.PureComponent<Props, State, null> {
  state = initialState;

  constructor(props: Props) {
    super(props);

    this.onPasswordChange = this.onPasswordChange.bind(this);
    this.decryptAccount = this.decryptAccount.bind(this);
    this.decryptAccountCallback = this.decryptAccountCallback.bind(this);
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

  decryptAccountCallback(percent: number): boolean {
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

  decryptAccount(e: React.MouseEvent<HTMLElement>) {
    if (e) e.preventDefault();

    const { account, accountName } = this.props;
    const { password } = this.state;

    if (account.privateKey) {
      throw (`Cannot decrypt ${accountName} because it is already decrypted`);
    }

    this.setState({
      state: LoginState.Decrypting
    })

    this.props.decrypt(password, this.decryptAccountCallback);
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

    const { account, accountName } = this.props;
    if (account && account.privateKey) {
        return <Redirect to={`/accounts/${accountName}`} />;
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
                  accountName: this.props.accountName
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
            placeholder="Account Password"
            message={message}
            isValid={isValid}
            forceValidate={showState}
          />
          <Button onClick={this.decryptAccount}>
            <FormattedMessage {...messages.buttonLogin} />
          </Button>
        </Form>
        <CancellableOperationModal cancelCallback={this.onCancelLogin} isOpen={isDecrypting} header={messages.decryptHeader} progressMessage={messages.decryptInProgress} progressPercent={this.state.percentComplete} />
      </React.Fragment>
    );
  }
}

const withConnect = connect(
  null,
  mapDispatchToProps
)


export const Login = compose(
  withConnect
)(LoginClass);
