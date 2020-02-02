import React from 'react';
import { AccountState } from '@the-coin/shared/containers/Account/types';
import { Download } from './download';
import { StoreGoogle } from '../../StoreOnline/Google';

import { Container, Divider, Header } from "semantic-ui-react"
import { isWallet } from '@the-coin/shared/SignerIdent';


interface MyProps {
  account: AccountState;
}

export function Settings({account}: MyProps) {
  const isLocal = isWallet(account.signer);
  return isLocal
  ? <Container id="accountSettings">
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
      <StoreGoogle address={account.address} />
    </Container>
  : <Container id="accountSettings">
      This account has no locally editable settings
    </Container>
}