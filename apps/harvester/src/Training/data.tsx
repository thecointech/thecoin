import { useEffect, useState } from 'react';
import { Input } from 'semantic-ui-react';

export enum Key {
  chequing="chequing",
  visa = "visa",

  chqInitBalance = "chqInitBalance",
  vsaInitBalance = "vsaInitBalance",

  wallet = "wallet",
  pluginsRequested = "pluginsRequested",
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

export const getData = (k: Key) => localStorage.getItem(k)
export const setData = (k: Key, val: string) => localStorage.setItem(k, val);
export const removeData = (k: Key) => localStorage.removeItem(k);

export const getChequingUrl = () => getData(Key.chequing);
export const setChequingUrl = (url: string) => setData(Key.chequing, url);

export const getVisaUrl = () => localStorage.getItem(Key.visa);
export const setVisaUrl = (url: string) => localStorage.setItem(Key.visa, url);

type SyncedInputProps = {
  type: Key,
  placeholder: string,
}

// An input that automatically syncs with LocalStorage
export const SyncedInput = ({type, placeholder}: SyncedInputProps) => {

  // Wrap in state so updates happen on change
  const [value, setValue] = useState(getData(type) ?? '');
  useEffect(() => {
    setData(type, value);
  }, [value]);

  return <Input
    onChange={(_, data) => setValue(data.value)}
    value={value}
    placeholder={placeholder}
  />
}
