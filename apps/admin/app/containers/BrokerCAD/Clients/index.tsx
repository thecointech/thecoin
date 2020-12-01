import React, { useEffect, useState } from "react";

import { GetFirestore } from "@the-coin/utilities/firestore";
import { Contract } from "ethers";
import { BigNumber } from "ethers/utils/bignumber";
import { List } from "semantic-ui-react";
import { Firestore } from "@the-coin/types";
import { Client, BaseClientData } from "./Client";
import { NormalizeAddress } from "@the-coin/utilities";
import { authorize, isValid } from "@the-coin/tx-processing/build/deposit/auth";
import { addFromGmail, initializeApi } from "@the-coin/tx-processing/build/deposit/addFromGmail";

type Props = {
  contract: Contract|null
};

export const Clients = ({contract}: Props) => {

  const firestore = GetFirestore();
  const [users, setUsers] = useState([] as BaseClientData[]);
  const [active, setActive] = useState(-1);

  // Fetch all users with balance
  useEffect(() => {
    getUsers(contract, firestore)
      .then(setUsers)
      .catch(alert)
  }, [contract, firestore])

  return (
    <List divided relaxed>
    {
      users
        .filter(u => !!u.balance)
        .map((u, index) => (
        <List.Item key={index}>
          <List.Content>
            <Client
              {...u}
              active={active === index}
              setActive={() => setActive(index)}
             />
        </List.Content>
      </List.Item>
    ))
  }
  </List>);
}

async function getUsers(contract: Contract|null, firestore: Firestore) : Promise<BaseClientData[]>
{
  if (!contract)
    return [];

  const emails = await getUserEmails();
  const qs = await firestore.collection("User").get();

  const addresses = Array.from(new Set([
    ...emails.map(u => NormalizeAddress(u.instruction.address)),
    ...qs.docs.map(c => NormalizeAddress(c.id)),
  ]));

  const rawBalances = await Promise.all(addresses.map(id => getBalance(id, contract)));
  return addresses.map((id, i) => ({
    address: id,
    balance: rawBalances[i],
    name: emails.find(d => NormalizeAddress(d.instruction.address) === id)?.instruction.name ?? "Not Found",
  }));
}

async function getBalance(user: string, contract: Contract)
{
  const balance = await contract.balanceOf(user) as BigNumber;
  return balance.toNumber()
}

async function getUserEmails()
{
  try {
    // First, connect and fetch new deposit emails.
    const auth = await authorize();
    if (isValid(auth))
    {
      await initializeApi(auth);
      // fetch all deposits
      return await addFromGmail('redirect interac -remember -expired -label:etransfer-rejected');
    }
  }
  catch(error) {
    console.log("Couldn't load emails: " + error);
  }
  return [];
}
