import { AccountState } from '@thecointech/account';
import { AnyAction, BillAction, BuyAction, getAllActions, getAllUsers, SellAction } from '@thecointech/broker-db';
import { FXRate, weBuyAt } from "@thecointech/fx-rates";
import { getSigner } from '@thecointech/signers';
import gmail, { eTransferData } from '@thecointech/tx-gmail';
import { Decimal } from 'decimal.js-light';

export type UserData = {
  address: string,
  name: string,
  buy: BuyAction[],
  sell: SellAction[],
  bill: BillAction[],
  transactions: AnyAction[],
  balanceCoin: Decimal;
  balanceCad: Decimal;
};

function findName(address: string, etransfers: eTransferData[]) {
  return etransfers.find(et => et.address === address)?.name
}

async function getUsers(emails: eTransferData[], account: AccountState) {
  // Get users from DB
  const usersDb = await getAllUsers();
  // Get all users that have interacted with our contract
  // We still need this step because there is no
  // guarantee that every active has gone through broker-service
  const theCoin = await getSigner('TheCoin');
  const tcAddr = await theCoin.getAddress();
  const history = account.history;
  const usersBC = history.map(h => h.counterPartyAddress).filter(addr => addr != tcAddr);
  // Get any other users present in emails.  Mostly to keep devlive happy
  const usersET = emails.map(e => e.address);
  const users = new Set([...usersET, ...usersDb, ...usersBC]);
  return [...users];
}

export async function getAllUserData(rates: FXRate[], account: AccountState) {
  const etransfers = await gmail.queryETransfers();
  // Get all users logged in the database
  const users = await getUsers(etransfers, account);

  // Our users will be
  const contract = account.contract!;
  const data = await getAllActions(users);
  const balances = await Promise.all(users.map(user => contract.balanceOf(user)));
  const now = new Date();

  return users.reduce((acc, user, idx) => ([
    ...acc,
    {
      address: user,
      name: findName(user, etransfers) ?? user,
      buy: data.Buy[user],
      sell: data.Sell[user],
      bill: data.Bill[user],
      transactions: [...data.Buy[user], ...data.Sell[user], ...data.Bill[user]].sort((a, b) => a.data.date.toMillis() - b.data.date.toMillis()),
      balanceCoin: new Decimal(balances[idx].toNumber()),
      balanceCad: new Decimal(balances[idx].toNumber()).mul(weBuyAt(rates, now))
    }
  ]), [] as UserData[])
}


