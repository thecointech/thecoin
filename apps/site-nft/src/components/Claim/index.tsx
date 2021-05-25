import { useActiveAccount } from '@thecointech/shared/containers/AccountMap';
import React, { useState } from 'react';
import { defineMessages } from 'react-intl';
import { Button, Form } from 'semantic-ui-react';
import { GetNftApi } from '../../api';
import { AppContainer } from '../AppContainers';
import { PageHeader } from '../PageHeader';
import icon from './images/icon_topup_big.svg';

const messages = defineMessages({
  title: { defaultMessage: "Claim Your Token", description: "Title message on claim page" },
  description: { defaultMessage: "Enter the code we sent you and the token ID it is for to assign it to your account", description: "Claim instructions" },
})

export const Claim = () => {
  const account = useActiveAccount()!;
  const [code, setCode] = useState('');
  const [tokenId, setTokenId] = useState('');
  const [_success, setSuccess] = useState(undefined as undefined|boolean);

  const doClaimCode = async () => {
    const api = GetNftApi();
    const r = await api.claimNft({
      tokenId: parseInt(tokenId),
      code,
      claimant: account.address,
    });
    setSuccess(r.data);
    alert("Claiming result: " + r.data);
  }
  return (
    <AppContainer shadow>
      <PageHeader illustration={icon} {...messages} />
      <Form>
        Your Address: {account?.address} <br />
        <Form.Input value={code}    onChange={(_, d) => setCode(d.value)} />
        <Form.Input value={tokenId} onChange={(_, d) => setTokenId(d.value)} />
        <Button onClick={doClaimCode} />
    </Form>
  </AppContainer>
  )
}
