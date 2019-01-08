import { FormattedMessage } from 'react-intl';
import { Color } from 'csstype';

export type ChangeCB = (value: string, score: number) => boolean;

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
