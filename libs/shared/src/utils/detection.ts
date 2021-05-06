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
