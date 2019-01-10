import { FormattedMessage } from 'react-intl';
import { Color } from 'csstype';
import { ChangeCB, ValidationResult } from 'components/UxInput/types';
import { ReactNode } from 'react';

export type ChangeCB = ChangeCB;
export type ValidationResult = ValidationResult;

interface OptionalProps {
  unMaskTime: number;
  as: React.ReactNode;
  forceValidate: boolean;
  footer?: ReactNode;
}

interface RequiredProps {
  intlLabel: FormattedMessage.MessageDescriptor;
  uxChange: ChangeCB;
}
