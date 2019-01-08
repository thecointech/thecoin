import React from 'react';
import { Wallet } from 'ethers';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import {
  Button,
  Modal,
  Header,
  Icon,
  Form,
  Loader,
} from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';
import * as Accounts from '../actions';
import { UxPassword } from 'components/UxPassword';
import { UxInput } from 'components/UxInput';
import messages from './messages'


const initialState = {
  accountPwd: '',
  accountName: '',
  validPwd: undefined as boolean | undefined,
  validName: undefined as boolean | undefined,
  forceValidate: false,
  redirect: false,
  isCreating: false,
  cancelCreating: false,
  percentComplete: 0,
};

type State = Readonly<typeof initialState>;
type Props = Accounts.DispatchProps;

class Create extends React.PureComponent<Props, State, any> {
  readonly state = initialState;

  constructor(props) {
    super(props);
    this.onPasswordChange = this.onPasswordChange.bind(this);
    this.onNameChange = this.onNameChange.bind(this);
    this.generateNewWallet = this.generateNewWallet.bind(this);
    this.cancelGenerate = this.cancelGenerate.bind(this);
  }

  cancelGenerate(e: React.MouseEvent<HTMLElement>) {
    this.setState({
      cancelCreating: true,
    });
  }

  generateNewWallet(e: React.MouseEvent<HTMLElement>) {
    if (e) e.preventDefault();

    // Generate a new wallet.  TODO: Detect if MetaMask is installed or active
    const { accountPwd, accountName, validPwd, validName } = this.state;

    if (!(validPwd && validName)) {
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
        // this.setState({ redirect: name });
        this.setState({ isCreating: false });
      });
  }

  // Validate our inputs
  onNameChange(value: string) {
    const isValid = value.length >= 1;
    this.setState({
      accountName: value,
      validName: isValid,
    });
    return {
      isValid: isValid,
      message: isValid ? undefined : messages.errorNameTooShort,
      tooltip: undefined
    }
  }

  onPasswordChange(value: string, score: number): boolean {
    const isValid = score > 2;
    this.setState({
      accountPwd: value,
      validPwd: isValid
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
            forceValidate={this.state.forceValidate}
            placeholder="Account Name"
          />
          <UxPassword
            uxChange={this.onPasswordChange}
            intlLabel={messages.labelPassword}
            forceValidate={this.state.forceValidate}
          //placeholder="Account Password"
          />

          <Button onClick={this.generateNewWallet}><FormattedMessage {...messages.buttonCreate} /></Button>
        </Form>
        <Modal open={this.state.isCreating} basic size="small">
          <Modal.Header>
            <FormattedMessage {...messages.whileCreatingHeader} />
          </Modal.Header>
          <Modal.Content>
            <Loader>
              <h3>
                <FormattedMessage {...messages.whileCreatingMessage} 
                  values={{
                    percentComplete: this.state.percentComplete
                  }}/>
              </h3>
            </Loader>
          </Modal.Content>
          <Modal.Actions>
            <Button color="red" onClick={this.cancelGenerate} inverted>
              <Icon name="cancel" /> Cancel
            </Button>
          </Modal.Actions>
        </Modal>
      </React.Fragment>
    );
  }
}

const mapDispatchToProps = {
  ...Accounts.mapDispatchToProps,
};

export default connect(
  null,
  mapDispatchToProps,
)(Create);
