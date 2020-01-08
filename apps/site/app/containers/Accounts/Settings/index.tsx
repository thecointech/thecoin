import React from 'react';
import { AccountState } from '@the-coin/shared/containers/Account/types';
import { Download } from './download';
import { GoogleConnect } from './gconnect';

import { Container, Divider, Header } from "semantic-ui-react"


interface MyProps {
  account: AccountState;
}

export function Settings(props: MyProps) {
  return (
  <Container id="accountSettings">
    <Divider horizontal>
      <Header as='h4'>
        Save Locally
      </Header>
    </Divider>
    <Download accountName={props.account.name} />
    <Divider horizontal>
      <Header as='h4'>
        Save Online
      </Header>
    </Divider>
    <GoogleConnect accountName={props.account.name} />
  </Container>
  );
}