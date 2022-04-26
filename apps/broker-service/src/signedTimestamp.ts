import { arrayify } from '@ethersproject/bytes';
import { keccak256 } from '@ethersproject/solidity';
import { verifyMessage } from '@ethersproject/wallet';
import { SignedMessage } from '@thecointech/types';


//
// Check the packet to ensure it's valid
// Returns address of signer if successful
export function getSigner({ message, signature }: SignedMessage) {
  // First, valid message?
	const ts = parseInt(message);
	// Message should be timestamp, within the last 5 minutes
	const age = Date.now() - ts;
	if (age > (5 * 60 * 1000))
		throw new Error("Timestamp too old");

  // Ok - it's a valid message.  Get the signer
	const mhash = GetHash(message);
	return verifyMessage(mhash, signature);
}

export function GetHash(
  value: string
) {
  const ethersHash = keccak256(
    ["string"],
    [value]
  );
  return arrayify(ethersHash);
}
