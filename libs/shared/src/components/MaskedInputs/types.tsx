import { AccountDetails } from 'containers/AccountDetails/types';

export type MaskedUxProps ={
    label: JSX.Element,
    value?: string,
    defaultValue?: string,
    className?: string,
    details?: AccountDetails,
    onChange?: (value: string, name?: string) => void,
    name: string, 
    readOnly?: boolean
  }