// import { type SelfID, getLink } from '@thecointech/idx';
import { AccountState } from '@thecointech/account';
import { BillAction, BuyAction, getAllActions, getAllUsers, PluginAction, SellAction } from '@thecointech/broker-db';
import gmail, { eTransferData } from '@thecointech/tx-gmail';
import Decimal from 'decimal.js-light';

export type UserData = {
  address: string,
  // details: AccountDetails;

  Buy: BuyAction[],
  Sell: SellAction[],
  Bill: BillAction[],
  Plugin: PluginAction[],
  balanceCoin: Decimal;
};

// function detailsFromEtransfer(address: string, etransfers: eTransferData[]) {
//   return {
//     given_name: etransfers.find(et => et.address === address)?.name
//   }
// }

async function getUsers(emails: eTransferData[], account: AccountState) {
  // Get users from DB
  const usersDb = await getAllUsers();
  // Get all users that have interacted with our contract
  // We still need this step because there is no
  // guarantee that every active has gone through broker-service
  const tcAddr = process.env.WALLET_TheCoin_ADDRESS;
  const history = account.history;
  const usersBC = history.map(h => h.counterPartyAddress).filter(addr => addr != tcAddr);
  // Get any other users present in emails.  Mostly to keep devlive happy
  const usersET = emails.map(e => e.address);
  const users = new Set([...usersET, ...usersDb, ...usersBC]);
  return [...users];
}

export async function getAllUserData(account: AccountState) {
  const etransfers = await gmail.queryETransfers();
  // Get all users logged in the database
  const users = await getUsers(etransfers, account);

  // Our users will be
  const contract = account.contract!;
  const data = await getAllActions(users);
  const balances = await Promise.all(users.map(user => contract.balanceOf(user)));
  // const details = await Promise.all(users.map(async (user) =>
  //   await loadDetails(user, account.idx!) ??
  //   detailsFromEtransfer(user, etransfers))
  // );

  return users.reduce((acc, user, idx) => ([
    ...acc,
    {
      address: user,
      Buy: data.Buy[user],
      Sell: data.Sell[user],
      Bill: data.Bill[user],
      Plugin: [],
      balanceCoin: new Decimal(balances[idx].toNumber()),
      // details: details[idx] ?? {},
    }
  ]), [] as UserData[])
}
