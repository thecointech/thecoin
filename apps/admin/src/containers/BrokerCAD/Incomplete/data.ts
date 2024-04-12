import { ActionType, getIncompleteActions } from '@thecointech/broker-db';
import { UserData } from '../Clients/data';
import Decimal from 'decimal.js-light';
import { GetContract } from '@thecointech/contract-core';

export async function fetchIncomplete() {

  const users: UserData[] = [];
  await fetchIncompleteType("Bill", users);
  await fetchIncompleteType("Buy", users);
  await fetchIncompleteType("Sell", users);
  await fetchIncompleteType("Plugin", users);
  return users;
}

async function fetchIncompleteType(type: ActionType, users: UserData[]) {
  const buys = await getIncompleteActions(type);
  for (const action of buys) {
    const user = users.find(user => user.address == action.address) ??
      users[users.push(await newUserData(action.address)) - 1];

    //@ts-ignore - TS compiler can't reduce the types so reduces type to never.
    user[type].push(action);
  }
}

const newUserData = async (address: string) => ({
  address,
  Buy: [],
  Sell: [],
  Bill: [],
  Plugin: [],
  transactions: [],
  balanceCoin: await getBalance(address),
  details: {},
})

async function getBalance(address: string) {
  const contract = await GetContract();
  const balance = await contract.balanceOf(address);
  return new Decimal(balance.toString());
}
