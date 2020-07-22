import { ethers } from 'ethers';
import { SignedMessage } from "@the-coin/types";
//import { IsDebug } from './IsDebug'
//import TheCoinSpec from '@the-coin/contract';


export function ParseSignedMessage(signedMessage: SignedMessage) {
	return [
		ethers.utils.verifyMessage(signedMessage.message, signedMessage.signature),
		JSON.parse(signedMessage.message)
	];
}


// ---------------------------------------------------------\\
// Get/Restore bill payment info.




