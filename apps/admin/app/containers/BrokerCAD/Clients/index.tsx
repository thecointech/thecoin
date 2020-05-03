import React, { useEffect, useState } from "react";

import { GetFirestore } from "@the-coin/utilities/Firestore";
import { Contract } from "ethers";
import { Dictionary } from "lodash";
import { Transaction } from "@the-coin/shared/containers/Account/types";
import { loadAndMergeHistory } from "@the-coin/shared/containers/Account/history";

type Props = {
  contract: Contract
};

export const Clients = ({contract}: Props) => {

  const firestore = GetFirestore();
  const [users, setUsers] = useState([] as string[]);
  const [transactions, setTransactions] = useState({} as Dictionary<Transaction>);


  useEffect(() => {
    firestore.doc("User")
      .listCollections()
      .then(clients => clients.map(c => c.id))
      .then(setUsers);
  }, [])

  useEffect(() => {

    getAllTransactions(users, contract)
      .then(({balances, transactions}) => {
        //setTransactions
      })
  }, [contract, users])

  return (
    <div>hi
      {users.map(u => <div>{u}</div>)}
    </div>);
}


async function getAllTransactions(users: string[], contract: Contract) {

  const fromBlock = 0;
  var allTxs = users.map(u => (
    loadAndMergeHistory(u, fromBlock, contract, [])
  ));

  var allBalances = users.map(u =>
    contract.balanceOf(u)
  )

  var transactions = await Promise.all(allTxs);
  var balances = await Promise.all(allBalances);

  //transactions.zip(balances).map()
  return {
    balances,
    transactions
  }
}
