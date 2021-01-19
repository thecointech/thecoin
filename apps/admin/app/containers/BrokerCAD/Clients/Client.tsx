import React from 'react';
import { Header, List } from 'semantic-ui-react';
import { ClientTransaction } from './ClientTransaction';
import { UserState } from './types';

export type Props = UserState;

export const Client = (props: Props) =>
    <>
    <Header as='h4'>
      {props.names} - {props.balanceCad}
    </Header>
    <List>
      {props?.transactions.map(ClientTransaction)}
    </List>
    </>
