import React, { useState, useCallback } from 'react';
import { AccountState } from '@the-coin/shared/containers/Account/types';
import { Download } from './download';
import { Container, Divider, Header } from "semantic-ui-react"
import { isWallet } from '@the-coin/shared/SignerIdent';
import { Props as MessageProps, MaybeMessage } from "@the-coin/site-base/components/MaybeMessage"
import { StoreGoogle, UploadState } from 'containers/StoreOnline/Google';

interface MyProps {
  account: AccountState;
}

export function StorageOptions({account}: MyProps) {
  const isLocal = isWallet(account.signer);

  const [feedback, setFeedback] = useState({} as MessageProps)
  const onStateChange = useCallback((_state: UploadState, message: MessageProps) => {
    setFeedback(message);
  }, [setFeedback])

  return isLocal
  ? <Container id="accountSettings">
      <MaybeMessage {...feedback} />
      <Divider horizontal>
        <Header as='h4'>
          Save Locally
        </Header>
      </Divider>
      <Download address={account.address} />
      <Divider horizontal>
        <Header as='h4'>
          Save Online
        </Header>
      </Divider>
      <StoreGoogle onStateChange={onStateChange} />
    </Container>
  : <Container id="accountSettings">
      This account has no locally editable settings
    </Container>
}
