import { AccountId, AccountName } from "@thecointech/signers";
import { initCache } from "@thecointech/signers/cache";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

export type NamedAccounts = Record<AccountName, SignerWithAddress>;

const notNum = /^\D+/;
export const initAccounts = (accounts: SignerWithAddress[]) => {
  const r = Object.entries(AccountId)
    .filter(k => notNum.test(k[0]))
    .map(([k, v]) => { const r: [string, SignerWithAddress] = [k, accounts[v as number]]; return r })
    .reduce((obj, [k, v]) => { obj[k as AccountName] = v; return obj }, {} as NamedAccounts)
  initCache(r);
  return r;
}
