import { verifyMessage } from "ethers";
import { SignedMessage } from "@thecointech/types";

// Only used within tapcap-manager
export function ParseSignedMessage(signedMessage: SignedMessage) {
	return [
		verifyMessage(signedMessage.message, signedMessage.signature),
		JSON.parse(signedMessage.message)
	];
}


// ---------------------------------------------------------\\
// Get/Restore bill payment info.




