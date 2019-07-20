import messages from './OfflineSecureBkup.messages'
import { Option } from './Types';

export const OfflineSecureBkup: Option = {
	name: 'Secured Offline Backup',
	stored: 'offline',
	password: 'lastpass',
	maxValue: 100000,
	messages: messages
}