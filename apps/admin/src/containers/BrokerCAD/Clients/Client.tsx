import React from 'react';
import { Header, List } from 'semantic-ui-react';
import { ClientTransaction } from './ClientTransaction';
import { UserData } from './data';

export type Props = UserData;

export const Client = (props: Props) =>
  <>
    <Header as='h4'>
      {props.name} - {props.balanceCad.toString()}
      <Header.Subheader>
        {props.address}
      </Header.Subheader>
    </Header>
    <hr />
    <List>
      {props?.transactions.map(ClientTransaction)}
    </List>
  </>
