import React, { useEffect, useState } from "react";

import { GetFirestore } from "@the-coin/utilities/firestore";
import { Contract } from "ethers";
import { Dictionary } from "lodash";
import { Transaction } from "@the-coin/shared/containers/Account/types";
import { loadAndMergeHistory } from "@the-coin/shared/containers/Account/history";

type Props = {
  contract: Contract
};

type UserData = {
  balance: number;
  transactions: Transaction[];
}
export const Clients = ({contract}: Props) => {

  const firestore = GetFirestore();
  const [users, setUsers] = useState([] as string[]);
  const [transactions, setTransactions] = useState({} as Dictionary<UserData>);


  useEffect(() => {
    firestore.doc("User")
      .listCollections()
      .then(clients => clients.map(c => c.id))
      .then(setUsers);
  }, [])

  useEffect(() => {

    for (const u of users) {
      getTransactions(u, contract)
        .then(data => {
          setTransactions(
            {
              ...transactions,
              [u]: data
            }
          )
        });
    };
  }, [contract, users])

  return (
    <div>hi
      {Object.entries(transactions)
        .map(([u, data]) => <div>{u} - {data.balance}</div>)}
    </div>);
}

async function getTransactions(user: string, contract: Contract)
{
  const fromBlock = 0;
  var balance = await contract.balanceOf(user);
  var transactions = await loadAndMergeHistory(user, fromBlock, contract, []);

  return {
    balance,
    transactions
  }
}

// async function getAllTransactions(users: string[], contract: Contract) {

//   var allTxs = users.map(u => (
//     loadAndMergeHistory(u, fromBlock, contract, [])
//   ));

//   var allBalances = users.map(u =>
//     contract.balanceOf(u)
//   )

//   var transactions = await Promise.all(allTxs);
//   var balances = await Promise.all(allBalances);

//   //transactions.zip(balances).map()
//   return {
//     balances,
//     transactions
//   }
// }
