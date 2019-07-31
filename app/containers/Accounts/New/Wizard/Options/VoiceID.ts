import messages from './VoiceID.messages';
import { Option } from './Types';

export const VoiceID: Option = {
  name: 'Voice-ID Storage',
  stored: 'cloud',
  password: 'voice',
  maxValue: 1000,
  convenience: 0,
  messages: messages,
};