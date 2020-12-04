import { useFxRates, weBuyAt } from '@the-coin/shared/containers/FxRate';
import { toHuman } from '@the-coin/utilities';
import React from 'react';
import { Accordion, Icon } from 'semantic-ui-react';

// import { InitialCoinBlock } from '@the-coin/contract'
// import { Transaction } from "@the-coin/shared/containers/Account/types";
// import { loadAndMergeHistory } from "@the-coin/shared/containers/Account/history";

export type BaseClientData = {
  address: string;
  name: string|undefined;
  balance: number;
};
export type Props = {
  active: boolean;
  setActive: () => void
} & BaseClientData;

export const Client = (props: Props) => {
  // let txs = {
  //   ...transactions
  // };
  // for (const u of userIds) {

  //   setTransactions(txs);
  // }
  const fxRates = useFxRates();

  return (
    <Accordion>
    <Accordion.Title active={props.active} onClick={props.setActive}>
      <Icon name='dropdown' />
      {props.address} - {props.name}
        <span style={{float: 'right'}}>
          ${toHuman(props.balance * weBuyAt(fxRates.rates)).toFixed(2)
      }</span>

    </Accordion.Title>
    <Accordion.Content active={props.active}>
      <div>Recieved: </div>
    </Accordion.Content>
  </Accordion>
  );
}

// function getTransactions(address: string)
// {
//   const utx = await getTransactions(u, contract);
//   var balance = toHuman(utx.balance * weBuyAt(fxRates.rates), true)
//   txs = {
//     ...txs,
//     [u]: {
//       ...utx,
//       balance
//     }
//   }
// }
