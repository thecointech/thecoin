import { computeAddress } from 'ethers';
import { getEncryptionKey } from '@thecointech/account-details';
import { getSigner, type AccountName } from '@thecointech/signers';

//
// Print the encryption public key for a system account, for the .env files.
// The key is derived from a signature (see account-details/encryptionKey),
// so this works for every signer type (disk, hardhat, ledger, etc).
//
// Usage: yarn encKey cfg=<config> [AccountName=BrokerCAD]
//
const name = (process.argv[2] ?? "BrokerCAD") as AccountName;

const signer = await getSigner(name);
const address = await signer.getAddress();
const key = await getEncryptionKey(signer);

console.log(`# ${name} (${address}), encryption key address: ${computeAddress(key.publicKey)}`);
console.log(`WALLET_${name}_ENCKEY=${key.compressedPublicKey}`);
