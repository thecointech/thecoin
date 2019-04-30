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

import { buildReducer } from '@the-coin/components/containers/Account/reducer';
import { AccountMap } from '@the-coin/components/containers/Account/types';
import { structuredSelectAccounts } from '@the-coin/components/containers/Account/selector';
import { DispatchProps, buildMapDispatchToProps } from '@the-coin/components/containers/Account/actions';
import { UxScoredPassword } from 'components/UxScoredPassword';
import { UxInput } from 'components/UxInput';
import messages from './messages'
import { ModalOperation } from '@the-coin/components/containers/ModalOperation';
import { ReferrersApi } from '@the-coin/broker-cad';
import { IsValidReferrerId } from '@the-coin/utilities';


const initialState = {
  accountPwd: '',
  accountName: '',
  accountReferrer: '',

  pwdValid: undefined as boolean | undefined,
  pwdMessage: undefined as FormattedMessage.MessageDescriptor | undefined,

  nameValid: undefined as boolean | undefined,
  nameMessage: undefined as FormattedMessage.MessageDescriptor | undefined,

  referrerValid: undefined as boolean | undefined,
  referrerMessage: undefined as FormattedMessage.MessageDescriptor | undefined,

  forceValidate: false,
  redirect: false as false | string,
  isCreating: false,
  cancelCreating: false,
  percentComplete: 0,
};

type State = Readonly<typeof initialState>;
type Props = {
  accounts: AccountMap 
}  & DispatchProps;

class Create extends React.PureComponent<Props, State, any> {
  readonly state = initialState;

  constructor(props) {
    super(props);
    this.onPasswordChange = this.onPasswordChange.bind(this);
    this.onNameChange = this.onNameChange.bind(this);
    this.generateNewWallet = this.generateNewWallet.bind(this);
    this.onCancelGenerate = this.onCancelGenerate.bind(this);
    this.onReferrerChange = this.onReferrerChange.bind(this);
  }

  onCancelGenerate() {
    this.setState({
      cancelCreating: true,
    });
  }

  async generateNewWallet(e: React.MouseEvent<HTMLElement>) {
    if (e) e.preventDefault();

    // Generate a new wallet.  TODO: Detect if MetaMask is installed or active
    const { accountPwd, accountName, pwdValid, nameValid, accountReferrer, referrerValid } = this.state;

    if (!(pwdValid && nameValid && referrerValid)) {
      this.setState({
        forceValidate: true
      });
      return;
    }

    // Generate new account
    this.setState({ isCreating: true });

    const newAccount = Wallet.createRandom();

    var asStr = await newAccount.encrypt(accountPwd, percent => {
      if (this.state.cancelCreating) {
        this.setState({
          isCreating: false,
          cancelCreating: false,
        })
        throw 'User Cancelled';
      }
      const per = Math.round(percent * 100);
      this.setState({ percentComplete: per });
    });

    // If cancelled, do not store generated account
    if (this.state.isCreating == false) return;

    // Register this account on the server
    const api = new ReferrersApi();
    // Weird typescript hack
    var isRegistered: any = await api.referralCreate({
      newAccount: newAccount.address,
      referrerId: accountReferrer
    });

    if (!isRegistered.success) {
      alert("Registering this account failed. Please contact support@thecoin.io");
      return;
    }

    // Add to wallet, this makes it available to user on this site
    // We set the wallet in encrypted format, as we wish to force
    // the user to decrypt the account (to protect against misspelled
    // passwords)
    const asJson = JSON.parse(asStr);
    this.props.setWallet(accountName, asJson);

    // Switch to this newly created account
    this.setState({
      redirect: accountName,
      isCreating: false,
      cancelCreating: false
    });
  }

// Validate our inputs
onNameChange(value: string) {
  const validation = (value.length == 0) ?
    {
      nameValid: false,
      nameMessage: messages.errorNameTooShort,
    } : this.props.accounts[value] ?
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

async IsLegalReferrer(id: string) {
  const api = new ReferrersApi();
  // Weird issue: typescript not recognizing the return type
  const isValid: any = await api.referrerValid(id);
  return isValid.success;
}

async onReferrerChange(value: string) {
  const validation = (value.length != 6) ?
    {
      referrerValid: false,
      referrerMessage: messages.errorReferrerNumChars,
    } : !IsValidReferrerId(value) ?
    {
      referrerValid: false,
      referrerMessage: messages.errorReferrerInvalidCharacters,
    } : !(await this.IsLegalReferrer(value)) ?
    {
      referrerValid: false,
      referrerMessage: messages.errorReferrerUnknown
    } :
    {
      referrerValid: true,
      referrerMessage: undefined,
    };
  this.setState({
    accountReferrer: value,
    ...validation,
  });
}

/////////////////////////////////////////////////////////////
// Render
render() {
  if (this.state.redirect) {
    const addr = `/accounts/${this.state.redirect}`;
    return <Redirect to={addr} />;
  }
  const { forceValidate, pwdValid, pwdMessage, nameValid, nameMessage, referrerValid, referrerMessage } = this.state;

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
        <UxInput
          uxChange={this.onReferrerChange}
          intlLabel={messages.labelReferrer}
          forceValidate={forceValidate}
          isValid={referrerValid}
          message={referrerMessage}
          placeholder="Referrer"
        />

        <Button onClick={this.generateNewWallet}><FormattedMessage {...messages.buttonCreate} /></Button>
      </Form>
      <ModalOperation cancelCallback={this.onCancelGenerate} isOpen={this.state.isCreating} header={messages.whileCreatingHeader} progressPercent={this.state.percentComplete} progressMessage={messages.whileCreatingMessage} />
    </React.Fragment>
  );
}
}
const key = "__@create|ee25b960";

// We need to ensure we have the Accounts reducer live
// so we add the reducer here.
export default buildReducer<{}>(key)(
  connect(
    structuredSelectAccounts,
    buildMapDispatchToProps(key),
)(Create));
