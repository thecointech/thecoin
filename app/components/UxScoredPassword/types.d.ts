import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Color } from 'csstype';
import { ValidationResult } from 'components/UxPassword/types';

export type ChangeCB = (value: string, score: number) => ValidationResult;

interface OptionalProps {
  infoBar: true;
  statusColor: '#5CE592';
  statusInactiveColor: '#FC6F6F';
  as: React.ReactNode;
  forceValidate: boolean;
}

interface RequiredProps {
  intlLabel: FormattedMessage.MessageDescriptor;
  uxChange: ChangeCB;
}

interface Props {
  intlLabel: FormattedMessage.MessageDescriptor;
  onChange: ChangeCB;
  forceValidate?: boolean;

  infoBar: true;
  statusColor: Color;
  statusInactiveColor: Color;
  minScore: number;
  minLength: number;
  unMaskTime: number;
  as: React.ReactChild;
}
