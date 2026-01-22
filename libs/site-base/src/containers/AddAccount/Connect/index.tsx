import React, { useState } from 'react';
import { Form } from 'semantic-ui-react';
import { ConnectWeb3 } from '@thecointech/shared/containers/Account';
import { AccountMap } from '@thecointech/redux-accounts';
import { defineMessages, FormattedMessage } from 'react-intl';
import { WarnIfDisabled } from './WarnIfDisabled';
import { NameInput } from '../NewBaseClass/NameInput';
import { ReferralInput, registerReferral } from '../NewBaseClass/ReferralInput';
import { useNavigate } from 'react-router';
import { ButtonPrimary } from '../../../components/Buttons';
import { useFromQuery } from '../utils';
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

  const accountsApi = AccountMap.useApi();
  const navigate = useNavigate();
  const redirectTarget = useFromQuery('/');

  const onConnect = async (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    if (!(referral && name)) {
      setForceValidate(true);
      return false;
    }
    const web3 = await ConnectWeb3();
    if (web3) {
      accountsApi.addAccount(name, web3.address, web3.signer);
      registerReferral(web3.address, referral);
      navigate(redirectTarget);
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
