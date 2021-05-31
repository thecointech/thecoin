import { log } from '@thecointech/logging';
import { useActiveAccount } from '@thecointech/shared/containers/AccountMap';
import React, { useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { Button, Form } from 'semantic-ui-react';
import { GetNftApi } from '../../api';
import { AppContainer } from '../AppContainers';
import { PageHeader } from '../PageHeader';
import icon from './images/icon_topup_big.svg';

const messages = defineMessages({
  title: { defaultMessage: "Claim Your Token", description: "Title message on claim page" },
  description: { defaultMessage: "Enter the code we sent you and the token ID it is for to assign it to your account", description: "Claim instructions" },
  phTokenId: { defaultMessage: "ID of token purchased", description: "Placeholder for claim/tokenID input" },
  phCode: { defaultMessage: "Unlock code for the token purchased", description: "Placeholder for claim/code input" },
  claim: { defaultMessage: "Claim", description: "Claim button" },
})

export const Claim = () => {
  const account = useActiveAccount()!;
  const [code, setCode] = useState('');
  const [tokenId, setTokenId] = useState('');
  const [success, setSuccess] = useState(undefined as undefined | boolean);
  const intl = useIntl();

  const doClaimCode = async () => {
    log.trace({address: account.address, tokenId}, "User {address} is claiming tokenId {tokenId}");
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
        <Form.Input
          value={tokenId}
          placeholder={intl.formatMessage(messages.phTokenId)}
          onChange={(_, d) => setTokenId(d.value)} />
        <Form.Input
          value={code}
          placeholder={intl.formatMessage(messages.phCode)}
          onChange={(_, d) => setCode(d.value)}
        />
        <Button onClick={doClaimCode} >
          <FormattedMessage {...messages.claim} />
        </Button>
        <div>success: {success}</div>
      </Form>
    </AppContainer>
  )
}
