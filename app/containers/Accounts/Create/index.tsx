import React from 'react';
import { Wallet } from 'ethers';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import {
  Button,
  Header,
  Form,
} from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';
import * as Accounts from '../actions';
import { mapStateToProps as MapAccounts, ContainerState as AccountsProps } from '../selectors';
import { UxScoredPassword } from 'components/UxScoredPassword';
import { UxInput } from 'components/UxInput';
import messages from './messages'
import { CancellableOperationModal } from 'containers/CancellableOperationModal';


const initialState = {
  accountPwd: '',
  accountName: '',
  pwdValid: undefined as boolean | undefined,
  pwdMessage: undefined as FormattedMessage.MessageDescriptor|undefined,

  nameValid: undefined as boolean | undefined,
  nameMessage: undefined as FormattedMessage.MessageDescriptor|undefined,

  forceValidate: false,
  redirect: false as false|string,
  isCreating: false,
  cancelCreating: false,
  percentComplete: 0,
};

type State = Readonly<typeof initialState>;
type Props = Accounts.DispatchProps & AccountsProps;

class Create extends React.PureComponent<Props, State, any> {
  readonly state = initialState;

  constructor(props) {
    super(props);
    this.onPasswordChange = this.onPasswordChange.bind(this);
    this.onNameChange = this.onNameChange.bind(this);
    this.generateNewWallet = this.generateNewWallet.bind(this);
    this.onCancelGenerate = this.onCancelGenerate.bind(this);
  }

  onCancelGenerate() {
    this.setState({
      cancelCreating: true,
    });
  }

  generateNewWallet(e: React.MouseEvent<HTMLElement>) {
    if (e) e.preventDefault();

    // Generate a new wallet.  TODO: Detect if MetaMask is installed or active
    const { accountPwd, accountName, pwdValid, nameValid } = this.state;
    
    if (!(pwdValid && nameValid)) {
      this.setState({
        forceValidate: true
      });
      return;
    }

    // Generate new account
    this.setState({ isCreating: true });

    const newAccount = Wallet.createRandom();

    newAccount
      .encrypt(accountPwd, percent => {
        if (this.state.cancelCreating) {
          this.setState({
            isCreating: false,
            cancelCreating: false,
          })
          throw 'User Cancelled';
        }
        const per = Math.round(percent * 100);
        this.setState({ percentComplete: per });
      })
      .then(asStr => {
        // If cancelled, do not store generated account
        if (this.state.isCreating == false) return;

        // Add to wallet, this makes it available to user on this site
        // We set the wallet in encrypted format, as we wish to force
        // the user to decrypt the account (to protect against misspelled
        // passwords)
        const asJson = JSON.parse(asStr);
        this.props.setSingleAccount(accountName, asJson);

        // Switch to this newly created account
        this.setState({ 
          redirect: accountName,
          isCreating: false,
          cancelCreating: false
        });
      });
  }

  // Validate our inputs
  onNameChange(value: string) {
    const validation = (value.length == 0) ? 
    {
      nameValid: false,
      nameMessage: messages.errorNameTooShort,
    } : this.props.accounts.has(value) ? 
    {
      nameValid: false,
      nameMessage: messages.errorNameDuplicate,
    } :
    {
      nameValid: true,
      nameMessage: undefined,
    };

    this.setState({
      accountName: value,
      ...validation,
    });
  }

  onPasswordChange(value: string, score: number): boolean {
    const isValid = score > 2;
    this.setState({
      accountPwd: value,
      pwdValid: isValid
    })
    return isValid;
  }

  /////////////////////////////////////////////////////////////
  // Render
  render() {
    if (this.state.redirect) {
      const addr = `/accounts/${this.state.redirect}`;
      return <Redirect to={addr} />;
    }
    const { forceValidate, pwdValid, pwdMessage, nameValid, nameMessage } = this.state;
      
    return (
      <React.Fragment>
        <Form>
          <Header as="h1">
            <Header.Content>
              <FormattedMessage {...messages.header} />
            </Header.Content>
            <Header.Subheader>
              <FormattedMessage {...messages.subHeader} />
            </Header.Subheader>
          </Header>
          <UxInput
            uxChange={this.onNameChange}
            intlLabel={messages.labelName}
            forceValidate={forceValidate}
            isValid={nameValid}
            message={nameMessage}
            placeholder="Account Name"
          />
          <UxScoredPassword
            uxChange={this.onPasswordChange}
            intlLabel={messages.labelPassword}
            forceValidate={forceValidate}
            isValid={pwdValid}
            message={pwdMessage}
            placeholder="Account Password"
          />

          <Button onClick={this.generateNewWallet}><FormattedMessage {...messages.buttonCreate} /></Button>
        </Form>
        <CancellableOperationModal cancelCallback={this.onCancelGenerate} isOpen={this.state.isCreating} header={messages.whileCreatingHeader} progressPercent={this.state.percentComplete} progressMessage={messages.whileCreatingMessage} />
      </React.Fragment>
    );
  }
}

export default connect(
  MapAccounts,
  Accounts.mapDispatchToProps,
)(Create);
