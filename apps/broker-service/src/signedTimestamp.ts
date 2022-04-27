import { SignedMessage } from '@thecointech/types';
import { GetSigner } from '@thecointech/utilities/SignedMessages';

//
// Check the packet to ensure it's valid
// Returns address of signer if successful
export function getSigner(sm: SignedMessage) {
  // First, valid message?
	const ts = parseInt(sm.message);
	// Message should be timestamp, within the last 5 minutes
	const age = Date.now() - ts;
	if (age > (5 * 60 * 1000))
		throw new Error("Timestamp too old");

  // Ok - it's a valid message.  Get the signer
  return GetSigner(sm);
}
