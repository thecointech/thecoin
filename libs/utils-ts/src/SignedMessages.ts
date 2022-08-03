import { SignedMessage } from "@thecointech/types";
import { arrayify, Bytes } from '@ethersproject/bytes';
import { verifyMessage } from '@ethersproject/wallet';
import { keccak256 } from '@ethersproject/solidity';
import type { JsonRpcSigner } from "@ethersproject/providers";
import type { Signer } from "@ethersproject/abstract-signer";

export function GetHash(
  value: string
) {
  const ethersHash = keccak256(
    ["string"],
    [value]
  );
  return arrayify(ethersHash);
}

export async function GetSignedMessage(message: string, signer: Signer) : Promise<SignedMessage>
{
	return {
		message,
		signature: await sign(GetHash(message), signer)
	}
}

export async function GetSigner(signedMessage: SignedMessage) {
	const {message, signature} = signedMessage;
	return verifyMessage(GetHash(message), signature);
}

//
// IMPORTANT NOTE:
// Even though we are using Ethers directly, under the hood we may be
// communicating with a web3 node.  Differing implementations of signMessage
// treat the chechsum differently, with web3 using a single bit (0-1), and
// the standard (basically, everyone else) using the values 27-28 to verify
// the signature.  We normalize the generated signature here to follow
// the standard, and quietly curse the fragmented landscape that makes this possible.
// https://ethereum.stackexchange.com/questions/76810/sign-message-with-web3-and-verify-with-openzeppelin-solidity-ecdsa-sol
export async function sign(message: Bytes | string, signer: Signer) {
  const rpcSigner: JsonRpcSigner = signer as any;
  // Ethers 5.5 updated from using eth_sign to personal_sign
  // Ganache in Truffle 5 doesn't support personal_sign.
  // Sigh.... https://github.com/trufflesuite/ganache/issues/540
  const signature: string = (rpcSigner._legacySignMessage)
    ? await rpcSigner._legacySignMessage(message)
    : await signer.signMessage(message)

  // We expect sig to either be 0-1, or 27-28.  Normalize to 27-28 by
  // adding 27 if the value < 16 (ie, higher 4 bits are 0)
  return (signature.length == 132 && (signature[130] == '0'))
    ? signature.substr(0, 130) + (signature.substr(130) == "00" ? "1b" : "1c")
    : signature;
}
