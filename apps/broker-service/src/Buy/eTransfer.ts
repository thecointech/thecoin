import { GetWallet } from "../exchange/Wallet";
import { utils } from 'ethers';
import { getAddressShortCode } from "@thecointech/utilities/Address";
import { SignedMessage } from "@thecointech/types";
import { log } from '@thecointech/logging';

// Todo: move SignMessage-y fn's to utilities
export function GetHash(
  value: string
) {
  const ethersHash = utils.solidityKeccak256(
    ["string"],
    [value]
  );
  return utils.arrayify(ethersHash);
}

export async function GenerateCode(request: SignedMessage)
{
	const { message, signature } = request;
	// First, valid message?
	// Message should be timestamp, within the last 5 minutes
	const ts = parseInt(message);
	const age = Date.now() - ts;
	log.debug(`Generating code for TS: ${ts}, ${age / 1000}s old`);
	if (age > (5 * 60 * 1000))
		throw new Error("Timestamp too old");

	// Ok - it's a valid message.  Get the signer
	const mhash = GetHash(message);
	const address = utils.verifyMessage(mhash, signature);
	// generate this signers secret key
	const wallet = await GetWallet();
  return getAddressShortCode(address, wallet);
}
