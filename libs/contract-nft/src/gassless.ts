import { Signer, getBytes, solidityPackedKeccak256, verifyMessage } from 'ethers';
import { sign } from "@thecointech/utilities/SignedMessages";

export type GasslessUpdateRequest = {
  tokenId: number,
  lastUpdate: number,
  prefix: string,
  digest: string,
  signature: string,
};


export function getGasslessUpdateBuffer(tokenId: number, lastUpdate: number, prefix: string, digest: string) {
  // The concatenation for the signature is id, lastUpdate, prefix, hash
  const hash = solidityPackedKeccak256(
    ["uint256", "uint40", "uint16", "bytes32"],
    [
      tokenId,
      lastUpdate,
      prefix,
      digest,
    ]
  );
  return getBytes(hash);
}

//
// Client-side data creation.  Signer must be owner of tokenId
export async function signGasslessUpdate(signer: Signer, tokenId: number, lastUpdate: number, prefix: string, digest: string) : Promise<GasslessUpdateRequest> {
  const hash = getGasslessUpdateBuffer(tokenId, lastUpdate, prefix, digest);
  const signature = await sign(hash, signer);

  return {
    tokenId,
    lastUpdate,
    prefix,
    digest,
    signature,
  }
}

export function getGasslessSigner(transfer: GasslessUpdateRequest) {
  const { tokenId, lastUpdate, prefix, digest, signature } = transfer;
  const hash = getGasslessUpdateBuffer(tokenId, lastUpdate, prefix, digest);
  return verifyMessage(hash, signature);
}
