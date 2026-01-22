import React, { useState } from 'react';
import { BaseWallet, Wallet } from 'ethers';
import { Header, Form } from 'semantic-ui-react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { ModalOperation } from '@thecointech/shared/containers/ModalOperation';
import { ReferralInput, registerReferral } from '../NewBaseClass/ReferralInput';
import { NameInput } from '../NewBaseClass/NameInput';
import { UxScoredPassword } from '@thecointech/shared/components/UX/ScoredPassword';
import { Decoration } from '../Decoration';
import { ButtonPrimary } from '../../../components/Buttons';
import { AccountMap } from '@thecointech/redux-accounts';
import styles from './styles.module.less';
import { CompleteInit } from '../CompleteInit';
import { useLocation } from 'react-router';

let _isCancelled = false;
const setCancelled = () => _isCancelled = true;

const translations = defineMessages({
  aboveTheTitle : {
      defaultMessage: 'Second Step',
      description: 'app.account.create.form.aboveTheTitle: Title above the main Title for the create account form page'},
  title : {
      defaultMessage: 'Create your Account',
      description: 'app.account.create.form.title: Title above the main Title for the create account form page'},
  buttonCreate : {
      defaultMessage: 'Create Account',
      description: 'app.account.create.form.buttonCreate: Button for the create account form page'},
  whileCreatingHeader : {
      defaultMessage: 'Creating Account...',
      description: 'app.account.create.whileCreatingHeader'},
  whileCreatingMessage : {
      defaultMessage: 'We are {percentComplete}% done cooking your brand-new account.',
      description: 'app.account.create.whileCreatingHeader'}
});

export const Generate = () => {

  const [wallet, setWallet] = useState(undefined as Wallet | undefined);
  const [referral, setReferral] = useState(undefined as MaybeString);
  const [name, setName] = useState(undefined as MaybeString);
  const [password, setPassword] = useState(undefined as MaybeString);
  const accountsApi = AccountMap.useApi();

  const [progress, setProgress] = useState(undefined as MaybeNumber);
  const [forceValidate, setForceValidate] = useState(false);
  const { search } = useLocation()
  ////////////////////////////////
  // Callback to actually generate the account
  const onGenerate = async () => {
    if (!(password && referral && name)) {
      setForceValidate(true);
      return false;
    }
    _isCancelled = false;
    const generated = await generateNewWallet(password, setProgress);
    if (generated) {
      const { wallet, decrypted } = generated;
      accountsApi.addAccount(name, wallet.address, wallet);
      registerReferral(wallet.address, referral);
      setWallet(decrypted);
    }

    // Else, we probably cancelled, so do nothing...
    return undefined;
  }

  // Create a new component to finish initialization.  This
  // is because we cannot add additional hooks to this component to start the account
  if (wallet) {
    const nextStep = `/addAccount/store${search}`;
    return <CompleteInit signer={wallet} address={wallet.address} redirect={nextStep} />
  }
  ////////////////////////////////

  // const cbCancel = (progress && progress < 100)
  //   ? setCancelled
  //   : undefined;
  // const cbOk = cbCancel
  //   ? undefined
  //   : onComplete

  return (
    <div className={`${styles.wrapper}`}>
      <Header as="h5" className={`x8spaceBefore `}>
          <FormattedMessage {...translations.aboveTheTitle} />
      </Header>
      <Header as="h2">
        <FormattedMessage {...translations.title} />
      </Header>
      <Form className={`${styles.createAccountForm} x8spaceBefore`} id={styles.createAccountForm}>
        <div className={`container ui`}>
          <NameInput forceValidate={forceValidate} setName={setName} />
        </div>
        <UxScoredPassword forceValidate={forceValidate} onValue={setPassword} />
        <div className={`container ui`}>
          <ReferralInput forceValidate={forceValidate} setReferral={setReferral} />
        </div>
        <ButtonPrimary className={`x8spaceBefore`} onClick={onGenerate} size="medium">
          <FormattedMessage {...translations.buttonCreate} />
        </ButtonPrimary>
        <Decoration />
      </Form>
      <ModalOperation
        cancelCallback={setCancelled}
        //okCallback={cbOk}
        isOpen={progress !== undefined}
        header={translations.whileCreatingHeader}
        progressPercent={progress!}
        progressMessage={translations.whileCreatingMessage}
      />
    </div>
  );
}

const generateNewWallet = async (password: string, setProgress: (v: number) => void) => {
  // Generate a new wallet.  TODO: Detect if MetaMask is installed or active

  // Generate new account
  setProgress(0);

  const newWallet = Wallet.createRandom();
  const asStr = await newWallet.encrypt(password, (percent: number) => {
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
