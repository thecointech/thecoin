import { BrokerCAD } from "@the-coin/types";
import { GetWallet } from "../exchange/Wallet";
import { utils } from 'ethers';
import { GetReferrerCode } from "@the-coin/utilities/lib/Referrals";

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

export async function GenerateCode(request: BrokerCAD.SignedMessage)
{
	const { message, signature } = request;
	// First, valid message?
	// Message should be timestamp, within the last 5 minutes

	const ts = parseInt(message);
	const age = Date.now() - ts;
	console.log(`Generating code for TS: ${ts}, ${age / 1000}s old`);
	if (age > (5 * 60 * 1000))
		throw("Timestamp too old");

	// Ok - it's a valid message.  Get the signer
	const mhash = GetHash(message);
	const signer = utils.verifyMessage(mhash, signature);
	// generate this signers secret key
	const wallet = await GetWallet();
	const rhash = GetHash(signer.toLowerCase());
	const rsign = await wallet.signMessage(rhash);
	// We multi-purpose the referrer code
	// to give a unique & repeatable code per-user
	return GetReferrerCode(rsign);
}