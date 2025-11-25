import { AccountDetails } from '@thecointech/account';
import type { JSX } from 'react';

export type MaskedUxProps ={
    intlLabel: JSX.Element,
    value?: string,
    defaultValue?: string,
    className?: string,
    details?: AccountDetails,
    uxChange?: (value: string, name?: string) => void,
    name: string,
    readOnly?: boolean
  }
