
export function IsValidAddress(address: string) {
	return /^(0x)?[a-fA-F0-9]{40}$/.test(address);
}

export function NormalizeAddress(address: string) {
	return address.length == 40 ? `0x${address.toUpperCase()}` : `0x${address.slice(2).toUpperCase()}`
}