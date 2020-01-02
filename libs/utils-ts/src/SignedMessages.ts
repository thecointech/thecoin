import { utils, Signer } from "ethers";
import { SignedMessage } from "@the-coin/types";

export function GetHash(
  value: string
) {
  const ethersHash = utils.solidityKeccak256(
    ["string"],
    [value]
  );
  return utils.arrayify(ethersHash);
}

export async function GetSignedMessage(message: string, signer: Signer) : Promise<SignedMessage>
{
	return {
		message,
		signature: await signer.signMessage(GetHash(message))
	}
}

export async function GetSigner(signedMessage: SignedMessage) {
	const {message, signature} = signedMessage;
	return utils.verifyMessage(GetHash(message), signature);
}