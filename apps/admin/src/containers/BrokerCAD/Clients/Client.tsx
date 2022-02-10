import { useFxRates } from '@thecointech/shared/containers/FxRate';
import React from 'react';
import { Header, List } from 'semantic-ui-react';
import { ClientTransaction } from './ClientTransaction';
import { UserData } from './data';
import { toCAD } from './toCAD';

export type Props = UserData;

export const Client = (props: Props) => {
  const rates = useFxRates();
  const transactions = [
    ...props.Buy,
    ...props.Sell,
    ...props.Bill,
  ].sort((a, b) => a.data.date.toMillis() - b.data.date.toMillis());

  return (
    <>
    <Header as='h4'>
      {props.name} - {toCAD(props.balanceCoin, rates.rates)}
      <Header.Subheader>
        {props.address}
      </Header.Subheader>
    </Header>
    <hr />
    <List>
      {transactions.map(ClientTransaction)}
    </List>
  </>
  )
}

