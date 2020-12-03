import React, { useState, useCallback } from 'react';
import { Wallet } from 'ethers';
import { Button, Header, Form } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';
import { ModalOperation } from '@the-coin/shared/containers/ModalOperation';
import { RouteComponentProps } from 'react-router-dom';
import { ReferralInput, registerReferral } from '../NewBaseClass/ReferralInput';
import { NameInput } from '../NewBaseClass/NameInput';
import { PasswordInput } from './PasswordInput';
import { useAccountMapApi } from '@the-coin/shared/containers/AccountMap';
import messages from '../messages';

import styles from './styles.module.less';
import { Decoration } from 'components/Decoration';

let _isCancelled = false;
const setCancelled = () => _isCancelled = true;

const aboveTheTitle = { id:"site.Account.create.form.aboveTheTitle",
                        defaultMessage:"First Step",
                        description:"Title above the main Title for the create account form page"};
const title = { id:"site.Account.create.form.title",
                defaultMessage:"Create your Account",
                description:"Title above the main Title for the create account form page"};
const buttonCreate = {  id:"site.Account.create.form.button",
                        defaultMessage:"Create Account",
                        description:"Button for the create account form page"};

export const Generate = (props: RouteComponentProps) => {

  const [name, setName] = useState(undefined as MaybeString);
  const [password, setPassword] = useState(undefined as MaybeString);
  const [referral, setReferral] = useState(undefined as MaybeString);
  const [progress, setProgress] = useState(undefined as MaybeNumber);
  const [forceValidate, setForceValidate] = useState(false);


  ////////////////////////////////
  // Callback to actually generate the account
  const accountMapApi = useAccountMapApi();
  const { history } = props;
  const onGenerate = useCallback(async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    if (!(password && referral && name)) {
      setForceValidate(true);
      return false;
    }
    _isCancelled = false;
    const generated = await generateNewWallet(password, setProgress);
    if (generated) {
      const { wallet, decrypted } = generated;
      accountMapApi.addAccount(name, wallet, true, decrypted);
      accountMapApi.setActiveAccount(wallet.address)
      registerReferral(wallet.address, referral);

      const toStoragePage = "/addAccount/store" ; //new RUrl(location.pathname, "..", "store");
      history.push(toStoragePage);
    }

    // Else, we probably cancelled, so do nothing...
    return undefined;
  }, [name, password, referral, setForceValidate, setProgress, accountMapApi, history])
  ////////////////////////////////

  // const cbCancel = (progress && progress < 100)
  //   ? setCancelled
  //   : undefined;
  // const cbOk = cbCancel
  //   ? undefined
  //   : onComplete

  return (
    <React.Fragment>
      <Form className={styles.content}>
        <Header as="h5">
            <FormattedMessage {...aboveTheTitle} />
        </Header>
        <Header as="h2">
          <FormattedMessage {...title} />
        </Header>
        <NameInput forceValidate={forceValidate} setName={setName}/>
        <PasswordInput forceValidate={forceValidate} setPassword={setPassword} />
        <ReferralInput forceValidate={forceValidate} setReferral={setReferral} />
        <Button onClick={onGenerate} primary size="big">
          <FormattedMessage {...buttonCreate} />
        </Button>
        <Decoration />
      </Form>
      <ModalOperation
        cancelCallback={setCancelled}
        //okCallback={cbOk}
        isOpen={progress !== undefined}
        header={messages.whileCreatingHeader}
        progressPercent={progress!}
        progressMessage={messages.whileCreatingMessage}
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
