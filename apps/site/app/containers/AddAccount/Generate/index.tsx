import React, { useState, useCallback } from 'react';
import { Wallet } from 'ethers';
import { connect } from 'react-redux';
import { Button, Header, Form, Container } from 'semantic-ui-react';
import { FormattedMessage, MessageDescriptor } from 'react-intl';
import { injectSingleAccountReducer } from '@the-coin/shared/containers/Account/reducer';
import { structuredSelectAccounts } from '@the-coin/shared/containers/Account/selector';
import { buildMapDispatchToProps } from '@the-coin/shared/containers/Account/actions';
import { UxScoredPassword } from 'components/UxScoredPassword';
import messages from '../messages';
import { ModalOperation } from '@the-coin/shared/containers/ModalOperation';
import {
  initialState as BaseInitial,
  NewBaseClass
} from '../NewBaseClass/index';
import { Redirect } from 'react-router-dom';
import { ReferralInput } from '../NewBaseClass/ReferralInput';
import { NameInput } from '../NewBaseClass/NameInput';
import { PasswordInput } from './PasswordInput';

const initialState = {
  ...BaseInitial,
  accountPwd: '',
  pwdValid: undefined as boolean | undefined,
  pwdMessage: undefined as MessageDescriptor | undefined,

  isCreating: false,
  cancelCreating: false,
  percentComplete: 0,
};

type State = Readonly<typeof initialState>;

let _isCancelled = false;

export const Generate = () => {

  const [name, setName] = useState(undefined as MaybeString);
  const [password, setPassword] = useState(undefined as MaybeString);
  const [referral, setReferral] = useState(undefined as MaybeString);
  const [progress, setProgress] = useState(undefined as MaybeNumber);
  const [forceValidate, setForceValidate] = useState(false);

  if (this.ShouldRedirect()) {
    const addr = `/accounts`;
    return <Redirect to={addr} />;
  }

  const onGenerate = useCallback((e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    if (!(password && referral && name)) {
      setForceValidate(true);
      return false;
    }
    _isCancelled = false;
    generateNewWallet(name, password, referral, setProgress);
  }, [name, password, referral, setForceValidate, setProgress])
  // const { forceValidate, pwdValid, pwdMessage, isCreating, percentComplete } = this.state;

  // console.log(`Pc: ${percentComplete}`);
  // const cbCancel = isCreating && percentComplete < 100
  //   ? this.onCancelGenerate 
  //   : undefined;
  // const cbOk = cbCancel
  //   ? undefined
  //   : this.onFinishedGenerate

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
        <NameInput forceValidate={forceValidate} setName={setName}/>
        <PasswordInput forceValidate={forceValidate} setPassword={setPassword} />
        <ReferralInput forceValidate={forceValidate} setReferral={setReferral} />
        <Button onClick={generateNewWallet} id="buttonCreateAccountStep1">
          <FormattedMessage {...messages.buttonCreate} />
        </Button>
      </Form>
      <ModalOperation
        cancelCallback={cbCancel}
        okCallback={cbOk}
        isOpen={isCreating}
        header={messages.whileCreatingHeader}
        children={
          <Container>
            <FormattedMessage 
              {...messages.whileCreatingMessage}
              values={{
                percentComplete: percentComplete,
              }}
            />
          </Container>
        }
      />
      
    </React.Fragment>
  );
}


const generateNewWallet = async (name: string, password: string, referral: string, setProgress: (v: number) => void) => {
  // Generate a new wallet.  TODO: Detect if MetaMask is installed or active

  // Generate new account
  setProgress(0);

  const newAccount = Wallet.createRandom();
  var asStr = await newAccount.encrypt(password, (percent: number) => {
    if (this.state.cancelCreating) {
      this.setState({
        isCreating: false,
        cancelCreating: false,
      });
      throw 'User Cancelled';
    }
    const per = Math.round(percent * 100);
    setProgress(per);
  });

  // If cancelled, do not store generated account
  if (this.state.isCreating === false) return false;

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
  this.onFinishedGenerate();
  
  // Callback allows hosting element to react to completion
  if (this.props.onComplete) {
    this.props.onComplete(accountName);
  }

  return true;
}
