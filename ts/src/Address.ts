
export function IsValidAddress(address: string) {
	return /^(0x)?[a-g0-9]{40}$/i.test(address);
}

export function NormalizeAddress(address: string) {
	return address.length == 40 ? `0x${address.toUpperCase()}` : address.toUpperCase()
}

// Valid ID's exclude IOUL
export function IsValidReferrerId(id) {
	return /^[a-hj-km-np-tv-z0-9]{6}$/i.test(id)
}