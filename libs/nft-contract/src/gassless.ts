import { arrayify, solidityKeccak256, verifyMessage } from 'ethers/utils';
import { Signer } from 'ethers/abstract-signer';

export type GasslessUpdateRequest = {
  tokenId: number,
  lastUpdate: number,
  prefix: string,
  digest: string,
  signature: string,
};


export function getGasslessUpdateBuffer(tokenId: number, lastUpdate: number, prefix: string, digest: string) {
  // The concatenation for the signature is id, lastUpdate, prefix, hash
  const hash = solidityKeccak256(
    ["uint256", "uint40", "uint16", "bytes32"],
    [
      tokenId,
      lastUpdate,
      prefix,
      digest,
    ]
  );
  return arrayify(hash);
}

export async function signGasslessUpdate(signer: Signer, tokenId: number, lastUpdate: number, prefix: string, digest: string) : Promise<GasslessUpdateRequest> {
  const hash = getGasslessUpdateBuffer(tokenId, lastUpdate, prefix, digest);
  return {
    tokenId,
    lastUpdate,
    prefix,
    digest,
    signature: await signer.signMessage(hash)
  }
}

export function getGasslessSigner(transfer: GasslessUpdateRequest) {
  const { tokenId, lastUpdate, prefix, digest, signature } = transfer;
  const hash = getGasslessUpdateBuffer(tokenId, lastUpdate, prefix, digest);
  return verifyMessage(hash, signature);
}
