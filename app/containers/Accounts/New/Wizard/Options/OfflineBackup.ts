import messages from './OfflineBackup.messages';
import { Option } from './Types';

export const OfflineBkp: Option = {
  name: 'Offline Backup',
  stored: 'offline',
  maxValue: 1000,
  convenience: 1,
  messages: messages,
};