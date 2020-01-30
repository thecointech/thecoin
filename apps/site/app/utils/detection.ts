import { AccountMap } from "@the-coin/shared/containers/Account/types";
import { getDefaultAccount } from 'containers/Accounts/Selectors';

export const isOpera = () : boolean =>
  /Opera|OPR\//.test(navigator.userAgent)

export const isMetaMask = () : boolean =>
  !!(window as any).web3?.currentProvider?.isMetaMask

export const isWeb3Enabled = () : boolean => {
  const win: any = window;
  const { web3 } = win;
  return !!web3;
}

export type Web3Type = false|"Opera"|"Metamask"|"Generic";

export const getWeb3Type = (): Web3Type => 
  !isWeb3Enabled()
    ? false
    : isMetaMask()
      ? "Metamask"
      : isOpera()
        ? "Opera"    
        : "Generic";

export const hasAccount = (accounts: AccountMap) : boolean =>
  accounts && Object.keys(accounts).length > 0;

export const getDefaultAccountAddress = (accounts: AccountMap) : string => {
  const base = "/accounts/";

  const defaultAccount = getDefaultAccount(accounts);
  // If we know we have an account, automatically redirect to it
  if (defaultAccount) {
    return `${base}e/${encodeURI(defaultAccount)}`;
  }

  return base;
}
