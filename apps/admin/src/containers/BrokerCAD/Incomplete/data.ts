import { ActionType, getIncompleteActions } from '@thecointech/broker-db';
import { UserData } from '../Clients/data';
import { Decimal } from 'decimal.js-light';

export async function fetchIncomplete() {

  const users: UserData[] = [];
  await fetchIncompleteType("Bill", users);
  await fetchIncompleteType("Buy", users);
  await fetchIncompleteType("Sell", users);
  return users;
}

async function fetchIncompleteType(type: ActionType, users: UserData[]) {
  const buys = await getIncompleteActions(type);
  for (const action of buys) {
    const user = users.find(user => user.address == action.address) ??
      users[users.push(newUserData(action.address)) - 1];
    //@ts-ignore - TS compiler can't reduce the types so reduces type to never.
    user[type].push(action);
  }
}

const newUserData = (address: string) => ({
  address,
  name: "Fixme",
  Buy: [],
  Sell: [],
  Bill: [],
  transactions: [],
  balanceCoin: new Decimal(0),
})
