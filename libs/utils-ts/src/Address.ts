
import base32 from 'base32';
import { sign } from "./SignedMessages";
import type { Signer } from '@ethersproject/abstract-signer';
import { keccak256 } from '@ethersproject/solidity';
import { arrayify } from '@ethersproject/bytes';

export function IsValidAddress(address: string) {
	return /^(0x)?[a-fA-F0-9]{40}$/.test(address);
}

export function NormalizeAddress(address: string) {
	return address.length === 40 ? `0x${address.toUpperCase()}` : `0x${address.slice(2).toUpperCase()}`
}

export function AddressMatches(addr1: string, addr2: string) {
  // ignore inconsequential differ
  return NormalizeAddress(addr1) === NormalizeAddress(addr2);
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
  const rhash = GetHash(NormalizeAddress(address));
  return sign(rhash, signer);
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
