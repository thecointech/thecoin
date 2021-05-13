
import { Signer, utils } from 'ethers';
import base32 from 'base32';

export function IsValidAddress(address: string) {
	return /^(0x)?[a-fA-F0-9]{40}$/.test(address);
}

// Valid ID's exclude IOUL.  Defined here (rather than
// in broker-db) because it is used in site-app
export function IsValidReferrerId(id: string) {
	return /^[a-hj-km-np-tv-z0-9]{6}$/i.test(id)
}

export function NormalizeAddress(address: string) {
	return address.length === 40 ? `0x${address.toUpperCase()}` : `0x${address.slice(2).toUpperCase()}`
}

export function AddressMatches(addr1: string, addr2: string) {
  // ignore inconsequential differ
  return NormalizeAddress(addr1) === NormalizeAddress(addr2);
}

//
// Compact a hex signature to a shorter 6-digit base32 string.
// This maintains 32*6 bits of entropy (~1-bln) while being
// short enough for average human to memory.
export function getShortCode(signature: string) {
  const normSig = signature[1] == "x" ? signature.slice(2) : signature;
  const buffer = Buffer.from(normSig, "hex");
  const s2: string = base32.encode(buffer);
  return s2.slice(-6).toLowerCase();
}

//
// Get 6-digit address code.  Used for e-Transfers & referrals.
// Code is seeded by signer (ie - unique between eTransfer/referral)
export async function getAddressShortCode(address: string, signer: Signer)
{
  // generate this signers secret key
  const rhash = GetHash(address.toLowerCase());
  const rsign = await signer.signMessage(rhash);
  return getShortCode(rsign);
}

export function GetHash(
  value: string
) {
  const ethersHash = utils.solidityKeccak256(
    ["string"],
    [value]
  );
  return utils.arrayify(ethersHash);
}
