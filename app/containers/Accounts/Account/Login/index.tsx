import * as React from 'react';
import { Form, Header, Button } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';
import messages from './messages';
import { connect } from 'react-redux';
import { Wallet } from 'ethers';

import { mapDispatchToProps, DispatchProps } from 'containers/Accounts/actions';
import { UxPassword } from 'components/UxPassword';
import { CancellableOperationModal } from 'containers/CancellableOperationModal';
import { ValidationResult } from 'components/UxInput/types';

interface OwnProps {
  accountName: string,
  account: Wallet
}
type Props = OwnProps & DispatchProps;

const initialState = {
  password: '',
  percentComplete: 0,
  isDecrypting: false,
  cancelDecrypting: false,
  intlResult: null as null | FormattedMessage.MessageDescriptor
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

  onPasswordChange(value: string): ValidationResult {
    this.setState({
      password: value,
    });
    return {};
  }

  decryptAccountCallback(percent: number): boolean {
    console.log(percent);
    if (this.state.cancelDecrypting) {
      this.setState({
        isDecrypting: false,
        intlResult: messages.decryptCancelled
      })
      return false;
    }
    else if (percent == -1) {
      // Invalid password?
      if (!this.state.cancelDecrypting) {
        this.setState({
          isDecrypting: false,
          intlResult: messages.decryptIncorrectPwd
        })
      }
      return false;
    }
    else if (percent == 100) {
      this.setState({
        isDecrypting: false,
        cancelDecrypting: false,
        intlResult: messages.decryptSuccess
      })
    }
    else {
      this.setState({
        percentComplete: percent,
        intlResult: messages.decryptInProgress
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
      isDecrypting: true
    })

    this.props.decryptAccount(accountName, password, this.decryptAccountCallback);
  }

  render() {
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
            //placeholder="Account Password"
          />
          <Button onClick={this.decryptAccount}>
            <FormattedMessage {...messages.buttonLogin} />
          </Button>
        </Form>
        <CancellableOperationModal cancelCallback={this.onCancelLogin} isOpen={this.state.isDecrypting} header={messages.decryptHeader} progressMessage={messages.decryptInProgress} progressPercent={this.state.percentComplete} />
      </React.Fragment>
    );
  }
}

export const Login = connect(
  null,
  mapDispatchToProps
)(LoginClass);
