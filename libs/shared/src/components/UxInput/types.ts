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
  uxChange: (e:UxOnChange) => void;
  footer?: ReactNode;
  isValid?: boolean;
  message?: ValuedMessageDesc;
  tooltip?: MessageDescriptor;
  forceValidate?: boolean;
  isRequired?: boolean;

  // pass through additional props to underlying type
  [id: string]: any;
}
interface LabelWithIntl extends Props{
  intlLabel?: MessageDescriptor;
}
interface LabelWithElements extends Props{
  elementLabel?: JSX.Element;
}

export type UxLabel = LabelWithIntl | LabelWithElements;

export type UxOnChange = React.FormEvent<HTMLInputElement>;
