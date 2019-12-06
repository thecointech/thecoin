import React from 'react';
import { Wallet } from 'ethers';
import { connect } from 'react-redux';
import { Button, Header, Form } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';
import { buildReducer } from '@the-coin/components/containers/Account/reducer';
import { structuredSelectAccounts } from '@the-coin/components/containers/Account/selector';
import { buildMapDispatchToProps } from '@the-coin/components/containers/Account/actions';
import { UxScoredPassword } from 'components/UxScoredPassword';
import messages from '../messages';
import { ModalOperation } from '@the-coin/components/containers/ModalOperation';
import {
  initialState as BaseInitial,
  NewBaseClass,
  OwnProps
} from '../NewBaseClass/index';

const initialState = {
  ...BaseInitial,
  accountPwd: '',
  pwdValid: undefined as boolean | undefined,
  pwdMessage: undefined as FormattedMessage.MessageDescriptor | undefined,

  isCreating: false,
  cancelCreating: false,
  percentComplete: 0,
};
type State = Readonly<typeof initialState>;

class GenerateClass extends NewBaseClass<State> {

  readonly state = initialState;

  onCancelGenerate = () => this.setState({ cancelCreating: true });
  onGenerateNewWallet = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    await this.generateNewWallet();
  };
  onPasswordChange = (value: string, score: number): boolean => {
    const isValid = score > 2;
    this.setState({
      accountPwd: value,
      pwdValid: isValid,
    });
    return isValid;
  };

  async generateNewWallet() {
    // Generate a new wallet.  TODO: Detect if MetaMask is installed or active
    const {
      accountPwd,
      accountName,
      pwdValid,
      nameValid,
      accountReferrer,
      referrerValid,
    } = this.state;

    if (!(pwdValid && nameValid && referrerValid)) {
      this.setState({
        forceValidate: true,
      });
      return false;
    }

    // Generate new account
    this.setState({ isCreating: true });

    const newAccount = Wallet.createRandom();
    var asStr = await newAccount.encrypt(accountPwd, (percent: number) => {
      if (this.state.cancelCreating) {
        this.setState({
          isCreating: false,
          cancelCreating: false,
        });
        throw 'User Cancelled';
      }
      const per = Math.round(percent * 100);
      this.setState({ percentComplete: per });
    });

    // If cancelled, do not store generated account
    if (this.state.isCreating == false) return false;

    // Register this account with our system
    if (!(await this.registerReferral(newAccount.address, accountReferrer)))
      return false;

    // Add to wallet, this makes it available to user on this site
    // We set the wallet in encrypted format, as we wish to force
    // the user to decrypt the account (to protect against misspelled
    // passwords)
    const asJson = JSON.parse(asStr);
    this.props.setSigner(accountName, asJson);

    // Switch to this newly created account
    this.setState({
      isCreating: false,
      cancelCreating: false,
    });

    // Callback allows hosting element to react to completion
    if (this.props.onComplete) {
      this.props.onComplete(accountName);
    }
    else {
      this.setState({
        redirect: true
      })
    }
    return true;
  }

  /////////////////////////////////////////////////////////////
  // Render
  render() {
    if (this.ShouldRedirect()) {
      return this.RenderRedirect();
    }
    const { forceValidate, pwdValid, pwdMessage } = this.state;

    return (
      <React.Fragment>
        <Form id="formCreateAccountStep1">
          <Header as="h1">
            <Header.Content>
              <FormattedMessage {...messages.header} />
            </Header.Content>
            <Header.Subheader>
              <FormattedMessage {...messages.subHeader} />
            </Header.Subheader>
          </Header>
          {this.RenderNameInput()}
          <UxScoredPassword
            uxChange={this.onPasswordChange}
            intlLabel={messages.labelPassword}
            forceValidate={forceValidate}
            isValid={pwdValid}
            message={pwdMessage}
            placeholder="Account Password"
          />
          {this.RenderReferralInput()}
          <Button onClick={this.onGenerateNewWallet} id="buttonCreateAccountStep1">
            <FormattedMessage {...messages.buttonCreate} />
          </Button>
        </Form>
        <ModalOperation
          cancelCallback={this.onCancelGenerate}
          isOpen={this.state.isCreating}
          header={messages.whileCreatingHeader}
          progressPercent={this.state.percentComplete}
          progressMessage={messages.whileCreatingMessage}
        />
        <div><br />
          <a href="#/accounts/">
            {'<- Back To My Options'}
          </a>
        </div>
      </React.Fragment>
    );
  }
}
const key = '__@create|ee25b960';

// We need to ensure we have the Accounts reducer live
// so we add the reducer here.
export const Generate = buildReducer<OwnProps>(key)(
  connect(
    structuredSelectAccounts,
    buildMapDispatchToProps(key),
  )(GenerateClass),
);
