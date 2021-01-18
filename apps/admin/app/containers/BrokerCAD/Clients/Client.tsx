import { ReconciledRecord } from '@the-coin/tx-reconciliation';
import React from 'react';
import { Button, Header, Icon, List } from 'semantic-ui-react';
import { UserState } from './types';

export type Props = UserState;

export const Client = (props: Props) => {

  return (
    <>
    <Header as='h4'>
      {props.names}
    </Header>
    <List>
      {props?.transactions.map(ClientTransaction)}
    </List>
    </>
  );
}

const ClientTransaction = (props: ReconciledRecord) =>
  <List.Item>
    {props.action} - {props.data.fiatDisbursed}
    {props.action == "Sell" && props.bank.length % 2 == 0
      ? <Button>Refund</Button>
      : <Icon check circle outline color='green' />
    }
  </List.Item>
