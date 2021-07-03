import { AccountId, AccountName } from "@thecointech/signers";

export type NamedAccounts = Record<AccountName, string>;

const notNum = /^\D+/;
export const toNamedAccounts = (accounts: string[]) =>
  Object.entries(AccountId)
        .filter(k => notNum.test(k[0]))
        .map(([k, v]) => [k, accounts[v as number]])
        .reduce((obj, [k, v]) => { obj[k as AccountName] = v; return obj }, {} as NamedAccounts)
