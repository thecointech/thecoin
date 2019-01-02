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
  Label,
  Input,
} from 'semantic-ui-react';
// import styles from './index.module.css';
import { PlusCircle } from 'utils/icons'
import * as Accounts from '../actions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Hack to fix InputPassword
// TODO: Consider taking over this project
// React.PropTypes = require('prop-types');
// React.createClass = require('create-react-class');
// var InputPassword = require('react-ux-password-field');

const initialState = {
  accountPwd: '',
  accountName: '',
  redirect: false,
  isCreating: false,
};

type State = Readonly<typeof initialState>;
type StateKeys = keyof State;
type Props = Accounts.DispatchProps;

class Create extends React.PureComponent<Props, State> {
  readonly state = initialState;

  constructor(props) {
    super(props);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.generateNewWallet = this.generateNewWallet.bind(this);
    this.cancelGenerate = this.cancelGenerate.bind(this);
  }

  cancelGenerate(e: React.MouseEvent<HTMLElement>) {
    this.setState({
      isCreating: false,
    });
  }

  generateNewWallet(e: React.MouseEvent<HTMLElement>) {
    if (e) e.preventDefault();

    // Generate a new wallet.  TODO: Detect if MetaMask is installed or active
    const pwd = this.state.accountPwd;
    const name = this.state.accountName;
    // if (pwd.length < 7) {
    //     alert("You need a longer password");
    //     return;
    // }
    // Generate new account
    this.setState({ isCreating: true });

    const newAccount = Wallet.createRandom();

    // const content = <div>Generating</div>;
    // this.props.showModalDialog(content);

    newAccount
      .encrypt(pwd, percent => {
        if (this.state.isCreating == false) {
          throw 'User Cancelled';
        }
        const per = Math.round(percent * 100);
        // content = <span>Progress: {per}%</span>;
        // this.props.setProgressPercent(per);
        console.log(per);
      })
      .then(asStr => {
        // If cancelled, do not store generated account
        if (this.state.isCreating == false) return;

        // Add to wallet, this makes it available to user on this site
        // We set the wallet in encrypted format, as we wish to force
        // the user to decrypt the account (to protect against misspelled
        // passwords)
        const asJson = JSON.parse(asStr);

        // Save to localStorage
        this.props.setSingleAccount(name, asJson);
        // this.props.closeModalDialog();
        // Switch to this newly created account
        // this.setState({ redirect: name });
        this.setState({ isCreating: false });
      });
  }

  handleInputChange(event: React.FormEvent<HTMLInputElement>, name: StateKeys) {
    const target = event.currentTarget;
    const value = target.value;

    this.setState(({
      [name]: value,
    } as any) as Pick<State, keyof State>);
  }

  render() {
    if (this.state.redirect) {
      const addr = `/accounts/${this.state.redirect}`;
      return <Redirect to={addr} />;
    }

    return (
      <React.Fragment>
        <Form>
          <Header as="h1">
            <FontAwesomeIcon icon={PlusCircle} />
            <Header.Content> &nbsp;&nbsp;Create a New Account</Header.Content>
            <Header.Subheader>
              Name your account anything you like, and give it a valid password.
            </Header.Subheader>
          </Header>
          <Form.Field>
            <Label>Account Name</Label>
            <Input
              onChange={e => this.handleInputChange(e, 'accountName')}
              value={this.state.accountName}
              placeholder="Account Name"
            />
          </Form.Field>
          <Form.Field>
            <Label>Password</Label>
            <Input
              onChange={e => this.handleInputChange(e, 'accountPwd')}
              value={this.state.accountPwd}
              placeholder="Password"
              type="password"
            />
          </Form.Field>
          <Button onClick={this.generateNewWallet}>CREATE ACCOUNT</Button>
        </Form>
        <Modal open={this.state.isCreating} basic size="small">
          <Header icon="browser" content="Cookies policy" />
          <Modal.Content>
            <h3>
              This website uses cookies to ensure the best user experience.
            </h3>
          </Modal.Content>
          <Modal.Actions>
            <Button color="green" onClick={this.cancelGenerate} inverted>
              <Icon name="cancel" /> Cancel
            </Button>
          </Modal.Actions>
        </Modal>
      </React.Fragment>
    );
  }
}

// const mapDispatchToProps = dispatch => ({
//   setAccount: (name, account) => dispatch(setAccount(name, account)),
//   setActive: account => dispatch(setActive(account)),
//   showModalDialog: contents => dispatch(showDialog(contents)),
//   closeModalDialog: () => dispatch(closeDialog()),
//   setProgressPercent: per => dispatch(setPercentage(per)),
// });

const mapDispatchToProps = {
  ...Accounts.mapDispatchToProps,
};

export default connect(
  null,
  mapDispatchToProps,
)(Create);
