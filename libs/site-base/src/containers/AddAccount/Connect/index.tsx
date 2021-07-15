import React, { useState } from 'react';
import { Form } from 'semantic-ui-react';
import { ConnectWeb3 } from '@thecointech/shared/containers/Account/Web3';
import { defineMessages, FormattedMessage } from 'react-intl';
import { WarnIfDisabled } from './WarnIfDisabled';
import { NameInput } from '../NewBaseClass/NameInput';
import { ReferralInput, registerReferral } from '../NewBaseClass/ReferralInput';
import { TheSigner } from '@thecointech/utilities/SignerIdent';
import { useHistory } from 'react-router';
import { ButtonPrimary } from '../../../components/Buttons';
import { IAccountStoreAPI, useAccountStoreApi } from '@thecointech/shared/containers/AccountMap';
import styles from '../styles.module.less';

const translations = defineMessages({
  buttonCreate : {
      defaultMessage: 'Create Account',
      description: 'app.addAccount.connect.buttonCreate'}
});

export const Connect = () => {

  const [name, setName] = useState(undefined as MaybeString);
  const [referral, setReferral] = useState(undefined as MaybeString);
  const [forceValidate, setForceValidate] = useState(false);

  const accountsApi = useAccountStoreApi();
  const history = useHistory();
  const onConnect = async (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    if (!(referral && name)) {
      setForceValidate(true);
      return false;
    }
    const theSigner = await ConnectWeb3();
    if (theSigner) {
      storeSigner(accountsApi, theSigner, name, referral);
      // We redirect directly to the now-active account
      history.push('/');
    }

    return true;
  };

  return (
    <>
      <WarnIfDisabled />
      <Form id={styles.createAccountForm}>
        <NameInput forceValidate={forceValidate} setName={setName} />
        <ReferralInput forceValidate={forceValidate} setReferral={setReferral} />
        <ButtonPrimary onClick={onConnect} size="medium">
          <FormattedMessage {...translations.buttonCreate} />
        </ButtonPrimary>
      </Form>
    </>
  );
}

const storeSigner = async (accountsApi: IAccountStoreAPI, wallet: TheSigner, name: string, referralCode: string) => {
  accountsApi.addAccount(name, wallet);
  registerReferral(wallet.address, referralCode);
}
