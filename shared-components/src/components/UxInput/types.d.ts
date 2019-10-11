import { FormattedMessage } from 'react-intl';
import { ReactNode } from 'react';
import { InputProps } from 'semantic-ui-react';

export enum ErrorState {
  Initial,
  Error,
  Success,
  Warning,
}

export type ChangeCB = (value: string) => void;

export interface Props {
  intlLabel: FormattedMessage.MessageDescriptor;
  uxChange: ChangeCB;
  footer?: ReactNode;
  isValid?: boolean;
  message?: FormattedMessage.MessageDescriptor;
  tooltip?: FormattedMessage.MessageDescriptor;

  forceValidate?: boolean;

  // pass through additional props to underlying type
  [id: string]: any;
}
