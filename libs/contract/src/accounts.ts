//
// Used in dev:live!
// Account types for the 10 accounts automatically created for us by Ganache
//
export enum AccountId {
  Owner,
  TheCoin,
  TCManager,
  Minter,
  Police,
  BrokerCAD,
  BrokerTransferAssistant,
  client1,
  client2,
  client3,
};

export type AccountName = keyof typeof AccountId;
export type NamedAccounts = Record<AccountName, string>;

const notNum = /^\D+/;
export const toNamedAccounts = (accounts: string[]) =>
  Object.entries(AccountId)
        .filter(k => notNum.test(k[0]))
        .map(([k, v]) => [k, accounts[v as number]])
        .reduce((obj, [k, v]) => { obj[k as AccountName] = v; return obj }, {} as NamedAccounts)
