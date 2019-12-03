import { AccountMap } from "@the-coin/components/containers/Account/types";

export const isOpera = () : boolean =>
  navigator.userAgent.indexOf("Opera") < 0;

export const isWeb3Enabled = () : boolean => {
  const win: any = window;
  const { web3 } = win;
  return !!web3;
}

export const hasAccount = (accounts: AccountMap) : boolean =>
  accounts && Object.keys(accounts).length > 0;

export const getDefaultAccountAddress = (accounts: AccountMap) : string => {
  const base = "/accounts";

  const firstAccount = accounts && Object.keys(accounts)[0];
  // If we know we have an account, automatically redirect to it
  if (firstAccount) {
    return `${base}/e/${encodeURI(firstAccount)}`;
  }

  if (isWeb3Enabled()) {
    return `${base}/connect`;
  }

  return base;
}
