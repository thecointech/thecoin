import { arrayify, solidityKeccak256, verifyMessage } from 'ethers/utils';
import { Signer } from 'ethers/abstract-signer';
import bs58 from 'bs58';

const remove0x = (s: string) => s.match(/^(?:0x)?(.+)$/i)?.[1] ?? s;
const getClaimTokenHash = (tokenId: number) => (
  arrayify(
    solidityKeccak256(["uint256"], [tokenId])
  )
)

//
// Generate a claim code for a given tokenId.  This code can be used
// to transfer a previously-minted but not-yet-owned token from the minter to any address
export async function getTokenClaimCode(tokenId: number, authority: Signer) {
  const hash = getClaimTokenHash(tokenId);
  const signed = await authority.signMessage(hash);
  // Remove the leading 0x
  const trimmed = remove0x(signed);
  // We encode the signature to base58, simply to
  // make the transmission shorter.
  const buffer = Buffer.from(trimmed || signed, 'hex');
  return bs58.encode(buffer);
}

//
// Decode code back into signature
export function getTokenClaimSig(code: string) {
  const buffer = bs58.decode(code);
  const signature = buffer.toString('hex');
  return `0x${remove0x(signature)}`;
}

//
// Get the authority who signed the given code.
export function getTokenClaimAuthority(tokenId: number, code: string) {
  const signature = getTokenClaimSig(code);
  const hash = getClaimTokenHash(tokenId);
  return verifyMessage(hash, signature);
}
