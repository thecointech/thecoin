import React, { useState, useCallback } from 'react';
import { Download } from './download';
import { Container, Divider, Header } from "semantic-ui-react"
import { isWallet } from '@the-coin/shared/SignerIdent';
import { Props as MessageProps, MaybeMessage } from "@the-coin/site-base/components/MaybeMessage"
import { StoreGoogle, UploadState } from 'containers/StoreOnline/Google';
import { useActiveAccount } from '@the-coin/shared/containers/AccountMap';

export function StorageOptions() {

  const activeAccount = useActiveAccount();
  const isLocal = isWallet(activeAccount!.signer);

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
      <Download address={activeAccount!.address} />
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
