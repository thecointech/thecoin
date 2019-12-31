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

export interface Props {
  intlLabel: MessageDescriptor;
  uxChange: ChangeCB;
  footer?: ReactNode;
  isValid?: boolean;
  message?: MessageDescriptor;
  tooltip?: MessageDescriptor;

  forceValidate?: boolean;

  // pass through additional props to underlying type
  [id: string]: any;
}
