import React, { useState } from 'react';
import { Form } from 'semantic-ui-react';
import { ConnectWeb3 } from '@thecointech/shared/containers/Account/Web3';
import { FormattedMessage } from 'react-intl';
import { WarnIfDisabled } from './WarnIfDisabled';
import { NameInput } from '../NewBaseClass/NameInput';
import { ReferralInput, registerReferral } from '../NewBaseClass/ReferralInput';
import messages from '../messages';
import { TheSigner } from '@thecointech/shared/SignerIdent';
import { useHistory } from 'react-router';
import { ButtonPrimary } from '@thecointech/site-base/components/Buttons';
import { IAccountStoreAPI, useAccountStoreApi } from '@thecointech/shared/containers/AccountMap';

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
      history.push('/accounts');
    }

    return true;
  };

  return (
    <>
      <WarnIfDisabled />
      <Form>
        <NameInput forceValidate={forceValidate} setName={setName} />
        <ReferralInput forceValidate={forceValidate} setReferral={setReferral} />
        <ButtonPrimary onClick={onConnect} size="medium">
          <FormattedMessage {...messages.buttonCreate} />
        </ButtonPrimary>
      </Form>
    </>
  );
}

const storeSigner = async (accountsApi: IAccountStoreAPI, wallet: TheSigner, name: string, referralCode: string) => {
  accountsApi.addAccount(name, wallet);
  registerReferral(wallet.address, referralCode);
}
