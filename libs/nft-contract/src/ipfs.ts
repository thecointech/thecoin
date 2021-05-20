import bs58 from 'bs58';
import { arrayify, solidityKeccak256 } from 'ethers/utils';
import { Signer } from 'ethers/abstract-signer';

//
// Split the input URI into Gateway/Prefix/Hash in hex format, ready
// for submission to updateMetaSha256 contract fn
export function splitIpfsUri(uri: string) {
  // split into gateway/hash
  const separator = (uri.lastIndexOf('/') ?? -1) + 1;
  const gateway = separator ? uri.slice(0, separator) : undefined;
  const hash = uri.slice(separator);

  const decoded = bs58.decode(hash);
  const prefix = decoded.slice(0, 2);
  const digest = decoded.slice(2);

  return {
    gateway,
    prefix: `0x${prefix.toString("hex")}`,
    digest: `0x${digest.toString("hex")}`,
  }
}

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

export function signGasslessUpdate(signer: Signer, tokenId: number, lastUpdate: number, prefix: string, digest: string) {
  const hash = getGasslessUpdateBuffer(tokenId, lastUpdate, prefix, digest);
  return signer.signMessage(hash)
}