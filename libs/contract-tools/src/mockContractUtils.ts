export const genRandHex = (size: number) => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
export const generateHash = (prefix = "0") => `0x${prefix}${genRandHex(63 - prefix.length)}`

// prefix is (e) for exactTransfer and (c) for certifiedTransfer, and (0) for other
// We embed this in the identifier so we can tell through the rest of the mock
// what kind of transaction it represented
export const genReceipt = (prefix: string = '0', opts?: any) => {
  return {
    wait: () => { },
    hash: generateHash(prefix),
    ...opts,
    confirmations: () => 2,
    nonce: 10,
  } as any// as ContractTransaction
}
