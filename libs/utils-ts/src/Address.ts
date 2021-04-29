
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
