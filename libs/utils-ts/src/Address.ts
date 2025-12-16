
import base32 from 'base32';
import { sign } from "./SignedMessages";
import { solidityPackedKeccak256, type Signer, getBytes, isAddress } from 'ethers';


export function IsValidAddress(address: string) {
	return /^(0x)?[a-fA-F0-9]{40}$/.test(address);
}

export function NormalizeAddress(address: string) {
  if (!isAddress(address)) {
    throw new Error("Cannot normalize address: " + address);
  }
  // TODO: This discards the checksum in the address,
  // consider changing this to return the checksumed address instead
	return address.length === 40 ? `0x${address.toUpperCase()}` : `0x${address.slice(2).toUpperCase()}`
}

export function AddressMatches(addr1?: string, addr2?: string) {
  // ignore inconsequential differ
  // If either address is undefined, no matching determination can be made
  return (addr1 && addr2)
    ? NormalizeAddress(addr1) === NormalizeAddress(addr2)
    : false;
}

// Valid ID's exclude SIOL.  Defined here (rather than
// in broker-db) because this fn is is used in site-app
// alphabet '0123456789abcdefghjkmnpqrtuvwxyz'
export function IsValidShortCode(id: string) {
	return /^[a-hj-km-np-rt-z0-9]{6}$/i.test(id)
}

//
// Compact a hex signature to a shorter 6-digit base32 string.
// This maintains 32*6 bits of entropy (~1-bln) while being
// short enough for average human to remember.
export function getShortCode(signature: string, offset = 0) {
  const normSig = signature[1] == "x" ? signature.slice(2) : signature;
  const buffer = Buffer.from(normSig, "hex");
  const s2: string = base32.encode(buffer);
  return s2
    .slice(-(6 + offset), offset ? -offset: undefined) // get the last 6 chars, shifted towards the start by offset
    .toLowerCase();
}

//
// Get 6-digit address code.  Used for e-Transfers & referrals.
// Code is seeded by signer (ie - unique between eTransfer/referral)
export async function getAddressShortCode(address: string, signer: Signer)
{
  const rsign = await getAddressShortCodeSig(address, signer);
  return getShortCode(rsign);
}

export function getAddressShortCodeSig(address: string, signer: Signer) {
  // generate this signers secret key
  const rhash = GetHash(NormalizeAddress(address).toLowerCase());
  return sign(rhash, signer);
}

export function GetHash(
  value: string
) {
  return getBytes(
    solidityPackedKeccak256(
      ["string"],
      [value]
    )
  );
}
