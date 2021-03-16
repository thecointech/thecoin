import React, { useCallback, useState } from 'react';
import { Form } from 'semantic-ui-react';
import { ConnectWeb3 } from '@thecointech/shared/containers/Account/Web3';
import { FormattedMessage } from 'react-intl';
import { WarnIfDisabled } from './WarnIfDisabled';
import { NameInput } from '../NewBaseClass/NameInput';
import { ReferralInput, registerReferral } from '../NewBaseClass/ReferralInput';
import messages from '../messages';
import { TheSigner } from '@thecointech/shared/SignerIdent';
import { IAccountMapActions, useAccountMapApi } from '@thecointech/shared/containers/AccountMap';
import { useHistory } from 'react-router';
import { ButtonPrimary } from '@thecointech/site-base/components/Buttons';

export const Connect = () => {

  const [name, setName] = useState(undefined as MaybeString);
  const [referral, setReferral] = useState(undefined as MaybeString);
  const [forceValidate, setForceValidate] = useState(false);

  const accountsApi = useAccountMapApi();
  const history = useHistory();
  const onConnect = useCallback(async (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    if (!(referral && name)) {
      setForceValidate(true);
      return false;
    }
    const theSigner = await ConnectWeb3();
    if (theSigner) {
      storeSigner(theSigner, name, referral, accountsApi);
      // We redirect directly to the now-active account
      history.push('/accounts');
    }

    return true;
  }, [referral, name, setForceValidate, accountsApi, history]);

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

const storeSigner = async (wallet: TheSigner, name: string, referralCode: string, accountsApi: IAccountMapActions) => {
  accountsApi.addAccount(name, wallet, true);
  accountsApi.setActiveAccount(wallet.address)
  registerReferral(wallet.address, referralCode);
}
