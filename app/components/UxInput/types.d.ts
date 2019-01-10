import { FormattedMessage } from 'react-intl';
import { ReactNode } from 'react';

export enum ErrorState {
  Initial,
  Error,
  Success,
  Warning,
}

export type ValidationResult = {
  isValid?: boolean;
  message?: FormattedMessage.MessageDescriptor;
  tooltip?: FormattedMessage.MessageDescriptor;
};

export type ChangeCB = (value: string) => ValidationResult;

export interface RequiredProps {
  readonly intlLabel: FormattedMessage.MessageDescriptor;
  readonly uxChange: ChangeCB;
  readonly footer?: ReactNode;
}

export interface OptionalProps {
  forceValidate: boolean;
}
