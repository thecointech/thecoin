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

export type ChangeCB = (value: string) => void;

// Allow embedding values directly into MessageDescriptor
export type ValuedMessageDesc = {
  values?: Object
} & MessageDescriptor;

export interface Props {
  intlLabel?: MessageDescriptor;
  label?: JSX.Element;
  uxChange: ChangeCB;
  uxchangenew?: (e:React.FormEvent<HTMLInputElement>) => void;
  footer?: ReactNode;
  isValid?: boolean;
  message?: ValuedMessageDesc | null;
  tooltip?: MessageDescriptor;

  forceValidate?: boolean;

  // pass through additional props to underlying type
  [id: string]: any;
}
