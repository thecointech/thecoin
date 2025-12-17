import { log } from '@thecointech/logging';
import { AccountMap } from '@thecointech/redux-accounts';
import React, { useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { Button, Form } from 'semantic-ui-react';
import { GetNftApi } from '@thecointech/apis/nft';
import { AppContainer } from '../AppContainers';
import { PageHeader } from '../PageHeader';
import icon from './images/icon_topup_big.svg';

const messages = defineMessages({
  title: { defaultMessage: "Claim Your Token", description: "Title message on claim page" },
  description: { defaultMessage: "Enter the code we sent you and the token ID it is for to assign it to your account", description: "Claim instructions" },
  phTokenId: { defaultMessage: "ID of token purchased", description: "Placeholder for claim/tokenID input" },
  phCode: { defaultMessage: "Unlock code for the token purchased", description: "Placeholder for claim/code input" },
  claim: { defaultMessage: "Claim", description: "Claim button" },

  success: { defaultMessage: "Success: <link>View the Transaction</link>", description: "Show on claim success" },
  failed: { defaultMessage: "Claim Failed: Please contact support", description: "Show on claim failed" },
})

export const Claim = () => {
  const account = AccountMap.useActive()!;
  const [code, setCode] = useState('');
  const [tokenId, setTokenId] = useState('');
  const [success, setSuccess] = useState<string | boolean | undefined>();
  const [claiming, setClaiming] = useState(false);
  const intl = useIntl();

  const doClaimCode = async () => {
    setClaiming(true);
    log.trace({ address: account.address, tokenId }, "User {address} is claiming tokenId {tokenId}");
    const api = GetNftApi();
    const r = await api.claimNft({
      tokenId: parseInt(tokenId),
      code,
      claimant: account.address,
    });
    setSuccess(r.data as unknown as boolean | string);
    setClaiming(false);
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
        <Button onClick={doClaimCode} loading={claiming}>
          <FormattedMessage {...messages.claim} />
        </Button>
        <Success success={success} />
      </Form>
    </AppContainer>
  )
}


const Success = ({ success }: { success: string | boolean | undefined }) =>
  success === undefined
    ? null
    : success
      ? <FormattedMessage
        {...messages.success}
        values={{
          link: (chunks: string) => <a target='_blank' href={`https://${process.env.DEPLOY_NETWORK}.etherscan.io/tx/${success}`}>{chunks}</a>
        }}
      />
      : <FormattedMessage {...messages.failed} />
