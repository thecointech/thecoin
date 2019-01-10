import { FormattedMessage } from 'react-intl';
import { ReactNode } from 'react';

export enum ErrorState {
  Initial,
  Error,
  Success,
  Warning,
}

export type ValidationResult = {
  isValid: boolean | undefined;
  message: FormattedMessage.MessageDescriptor | undefined;
  tooltip: FormattedMessage.MessageDescriptor | undefined;
};
// export type ValidationCB = (value: string) => ValidationResult;
export type ChangeCB = (value: string) => ValidationResult;

export interface Props {
  intlLabel: FormattedMessage.MessageDescriptor;
  footer?: ReactNode;
  onChange: ChangeCB;
  forceValidate?: boolean;
}
