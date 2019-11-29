import { AccountMap } from "@the-coin/components/containers/Account/types";

export const IsOpera = () =>
  navigator.userAgent.indexOf("Opera");

export const IsWeb3Enabled = () : boolean => {
  const win: any = window;
  const { web3 } = win;
  return !!web3;
}

export const GetDefaultAccountAddress = (accounts: AccountMap) : string => {
  const base = "/accounts";

  const firstAccount = accounts && Object.keys(accounts)[0];
  // If we know we have an account, automatically redirect to it
  if (firstAccount) {
    return `${base}/e/${encodeURI(firstAccount)}`;
  }

  if (IsWeb3Enabled()) {
    return `${base}/connect`;
  }

  return base;
}
