import { ChangeEventHandler } from 'react';
import { AccountDetails } from 'containers/AccountDetails/types';

export type MaskedUxProps ={
    label: JSX.Element,
    value?: string,
    defaultValue?: string,
    className?: string,
    details?: AccountDetails,
    onChange?: ChangeEventHandler<HTMLInputElement>,
    name: string, 
    readOnly?: boolean
  }