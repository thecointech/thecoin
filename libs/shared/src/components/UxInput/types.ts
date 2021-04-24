import { MessageDescriptor } from 'react-intl';
import { ReactNode } from 'react';

export const initialState = {
  value: '',
  showState: false,
};


export enum ErrorState {
  Initial,
  Error,
  Success,
  Warning,
}

// Allow embedding values directly into MessageDescriptor
export type ValuedMessageDesc = {
  values?: Object
} & MessageDescriptor;

export interface Props {
  intlLabel?: MessageDescriptor;
  label?: JSX.Element;
  uxChange: (e:React.FormEvent<HTMLInputElement>) => void;
  uxchangenew?: (e:React.FormEvent<HTMLInputElement>) => void;
  footer?: ReactNode;
  isValid?: boolean;
  message?: ValuedMessageDesc | null;
  tooltip?: MessageDescriptor;

  forceValidate?: boolean;

  // pass through additional props to underlying type
  [id: string]: any;
}
