import { ChangeEventHandler } from 'react';
import { AccountDetails } from 'containers/AccountDetails/types';

export type MaskedUxProps ={
    label: JSX.Element,
    value: {  } | undefined,
    className?: string,
    details?: AccountDetails,
    onChange?: ChangeEventHandler<HTMLInputElement> | undefined,
    name: string, 
    readOnly?: boolean
  }