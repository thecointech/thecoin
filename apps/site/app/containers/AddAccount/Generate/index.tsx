import React, { useState, useCallback } from 'react';
import { Wallet } from 'ethers';
import { Button, Header, Form, Container } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';
import { ModalOperation } from '@the-coin/shared/containers/ModalOperation';
import { Redirect, useHistory, RouteComponentProps } from 'react-router-dom';
import { ReferralInput, registerReferral } from '../NewBaseClass/ReferralInput';
import { NameInput } from '../NewBaseClass/NameInput';
import { PasswordInput } from './PasswordInput';
import { useAccountMapApi, IAccountMapActions } from '@the-coin/shared/containers/AccountMap';
import messages from '../messages';

// const initialState = {
//   ...BaseInitial,
//   accountPwd: '',
//   pwdValid: undefined as boolean | undefined,
//   pwdMessage: undefined as MessageDescriptor | undefined,

//   isCreating: false,
//   cancelCreating: false,
//   percentComplete: 0,
// };


let _isCancelled = false;
const setCancelled = () => _isCancelled = true;

export const Generate = (props: RouteComponentProps) => {

  const [name, setName] = useState(undefined as MaybeString);
  const [password, setPassword] = useState(undefined as MaybeString);
  const [referral, setReferral] = useState(undefined as MaybeString);
  const [progress, setProgress] = useState(undefined as MaybeNumber);
  const [forceValidate, setForceValidate] = useState(false);

  const accountMapApi = useAccountMapApi();

  if (progress && progress >= 100) {
    const addr = `/accounts`;
    return <Redirect to={addr} />;
  }

  const onGenerate = useCallback(async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    if (!(password && referral && name)) {
      setForceValidate(true);
      return false;
    }
    _isCancelled = false;
    const generated = await generateNewWallet(password, setProgress);
    if (generated) {
      storeWallet(generated.wallet, referral, generated.decrypted, accountMapApi);
    }
    return undefined;
  }, [name, password, referral, setForceValidate, setProgress])

  const history = useHistory();
  const onComplete = useCallback(() => {
    const toStoragePage = props.location.pathname + '/store'
    history.push(toStoragePage);
  }, [])


  // console.log(`Pc: ${percentComplete}`);
  const cbCancel = (progress && progress < 100)
    ? setCancelled 
    : undefined;
  const cbOk = cbCancel
    ? undefined
    : onComplete

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
        <Button onClick={onGenerate} id="buttonCreateAccountStep1">
          <FormattedMessage {...messages.buttonCreate} />
        </Button>
      </Form>
      <ModalOperation
        cancelCallback={cbCancel}
        okCallback={cbOk}
        isOpen={progress !== undefined}
        header={messages.whileCreatingHeader}
        children={
          <Container>
            <FormattedMessage 
              {...messages.whileCreatingMessage}
              values={{
                percentComplete: progress,
              }}
            />
          </Container>
        }
      />
      
    </React.Fragment>
  );
}


const generateNewWallet = async (password: string, setProgress: (v: number) => void) => {
  // Generate a new wallet.  TODO: Detect if MetaMask is installed or active

  // Generate new account
  setProgress(0);

  const newWallet = Wallet.createRandom();
  var asStr = await newWallet.encrypt(password, (percent: number) => {
    // To break out of this callback, we need to throw
    if (_isCancelled)
      throw 'User Cancelled';

    const per = Math.round(percent * 100);
    setProgress(per);
  });

  // If cancelled, do not store generated account
  if (_isCancelled) 
    return false;

  // Add to wallet, this makes it available to user on this site
  // We set the wallet in encrypted format, as we wish to force
  // the user to decrypt the account (to protect against misspelled
  // passwords)
  return { 
    wallet: JSON.parse(asStr),
    decrypted: newWallet,
  } 
}

const storeWallet = async (wallet: Wallet, referralCode: string, decrypted: Wallet, accountsApi: IAccountMapActions) => {
  accountsApi.addAccount(name, wallet, true, decrypted);
  accountsApi.setActiveAccount(wallet.address)
  registerReferral(wallet.address, referralCode);  
}