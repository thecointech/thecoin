export enum Key {
  chequing="chequing",
  visa = "visa",

  // wallet = "wallet",
  pluginCnvrtRequested = "pluginCnvrtRequested",
  pluginAbsrbRequested = "pluginAbsrbRequested",
}

// TODO: do we care?
export type DataMap = {
  CHQ: {
    url: string,
    initBalance: string,
    transferAmount: string,
  }
  VISA: {
    url: string,
    initBalance: string,
    dueDate: string,
    dueAmount: string,
  }
}

export const getData = (k: Key) => localStorage.getItem(k) ?? undefined
export const setData = (k: Key, val: string) => localStorage.setItem(k, val);
export const removeData = (k: Key) => localStorage.removeItem(k);

export const getChequingUrl = () => getData(Key.chequing);
export const setChequingUrl = (url: string) => setData(Key.chequing, url);

export const getVisaUrl = () => localStorage.getItem(Key.visa);
export const setVisaUrl = (url: string) => localStorage.setItem(Key.visa, url);


