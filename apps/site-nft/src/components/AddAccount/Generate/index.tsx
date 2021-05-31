import React, { useState } from 'react';
import { Wallet } from 'ethers';
import { Header, Form } from 'semantic-ui-react';
import { FormattedMessage } from 'react-intl';
import { ModalOperation } from '@thecointech/shared/containers/ModalOperation';
import { RouteComponentProps } from 'react-router-dom';
import { NameInput } from '../NewBaseClass/NameInput';
import { PasswordInput } from './PasswordInput';
import { Decoration } from 'components/Decoration';
import { ButtonPrimary } from '@thecointech/site-base/components/Buttons';
import { useAccountStoreApi } from '@thecointech/shared/containers/AccountMap';
import styles from './styles.module.less';

let _isCancelled = false;
const setCancelled = () => _isCancelled = true;

const aboveTheTitle = { id:"app.account.create.form.aboveTheTitle",
                        defaultMessage:"Second Step",
                        description:"Title above the main Title for the create account form page"};
const title = { id:"app.account.create.form.title",
                defaultMessage:"Create your Account",
                description:"Title above the main Title for the create account form page"};
const buttonCreate = {  id:"app.account.create.form.button",
                        defaultMessage:"Create Account",
                        description:"Button for the create account form page"};

const whileCreatingHeader = { id: `app.account.create.whileCreatingHeader`,
                              defaultMessage: 'Creating Account...',};
const whileCreatingMessage = { id: `app.account.create.whileCreatingMessage`,
                                defaultMessage: "We are {percentComplete}% done cooking your brand-new account."};

export const Generate = (props: RouteComponentProps) => {

  const [name, setName] = useState(undefined as MaybeString);
  const [password, setPassword] = useState(undefined as MaybeString);
  const [referral, /*setReferral*/] = useState(undefined as MaybeString);
  const [progress, setProgress] = useState(undefined as MaybeNumber);
  const [forceValidate, setForceValidate] = useState(false);


  ////////////////////////////////
  // Callback to actually generate the account
  const accountsApi = useAccountStoreApi();
  const { history } = props;
  const onGenerate = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    if (!(password && referral && name)) {
      setForceValidate(true);
      return false;
    }
    _isCancelled = false;
    const generated = await generateNewWallet(password, setProgress);
    if (generated) {
      const { wallet, decrypted } = generated;
      accountsApi.addAccount(name, wallet, true, true, decrypted);

      const toStoragePage = "/addAccount/store" ;
      history.push(toStoragePage);
    }

    // Else, we probably cancelled, so do nothing...
    return undefined;
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
          <FormattedMessage {...aboveTheTitle} />
      </Header>
      <Header as="h2">
        <FormattedMessage {...title} />
      </Header>
      <Form className={`${styles.createAccountForm} x8spaceBefore`} id={styles.createAccountForm}>
        <div className={`container ui`}>
          <NameInput forceValidate={forceValidate} setName={setName} isRequired={true} />
        </div>
        <PasswordInput forceValidate={forceValidate} setPassword={setPassword} />
        <ButtonPrimary className={`x8spaceBefore`} onClick={onGenerate} size="medium">
          <FormattedMessage {...buttonCreate} />
        </ButtonPrimary>
        <Decoration />
      </Form>
      <ModalOperation
        cancelCallback={setCancelled}
        //okCallback={cbOk}
        isOpen={progress !== undefined}
        header={whileCreatingHeader}
        progressPercent={progress!}
        progressMessage={whileCreatingMessage}
      />
    </div>
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
