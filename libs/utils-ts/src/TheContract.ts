import { ethers } from 'ethers';
import { SignedMessage } from "@thecointech/types";

// Only used within tapcap-manager
export function ParseSignedMessage(signedMessage: SignedMessage) {
	return [
		ethers.utils.verifyMessage(signedMessage.message, signedMessage.signature),
		JSON.parse(signedMessage.message)
	];
}


// ---------------------------------------------------------\\
// Get/Restore bill payment info.




