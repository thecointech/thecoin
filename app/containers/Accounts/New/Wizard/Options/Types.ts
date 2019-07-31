import { FormattedMessage } from 'react-intl';

export type ValueLimits = 100 | 1000 | 10000 | 100000 | 0;
export type Storage = 'cloud' | 'offline' | 'metamask' | 'opera' | 'safetyBox';
export type Verification = 'lastpass' | 'print' | 'voice' | 'fingerprint';
export type Accessible = 'true' | 'false' | undefined;

export type Convenience = 0 | 1 | 2 | 3; // 2 is most convenient

export interface Option {
  name: string;
  stored: Storage;
  password?: Verification;
  maxValue: ValueLimits;
  convenience: Convenience; // Higher is more convenient
  messages: {
    header: FormattedMessage.MessageDescriptor;
    description: FormattedMessage.MessageDescriptor;
    auth: FormattedMessage.MessageDescriptor;
    pros: FormattedMessage.MessageDescriptor;
    cons: FormattedMessage.MessageDescriptor;
  };
}