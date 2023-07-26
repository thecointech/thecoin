import { useEffect, useState } from 'react';
import { Input } from 'semantic-ui-react';
import { TrainingReducer } from './reducer';
import { BankKey, DataKey } from './types';

type SyncedInputProps = {
  // type: Key,
  bank: BankKey,
  param: DataKey,
  placeholder: string,
  onChange?: (value: string) => void,
}

// An input that automatically syncs with LocalStorage
export const SyncedInput = ({bank, param, placeholder}: SyncedInputProps) => {
  const api = TrainingReducer.useApi();
  const data = TrainingReducer.useData();
  // Wrap in state so updates happen on change
  const [value, setValue] = useState(data[bank][param] ?? '');
  useEffect(() => {
    // setData(type, value);
    api.setParameter(bank, param, value);
  }, [value]);

  return <Input
    onChange={(_, data) => setValue(data.value)}
    value={value}
    placeholder={placeholder}
  />
}
