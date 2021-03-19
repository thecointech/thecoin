import { readFileSync } from "fs";
import { Wallet } from 'ethers';
import { GetContract } from '@thecointech/contract'
process.env.CONFIG_NAME='prodtest';
import './setenv';

// Used to read back the mnemonic so we can deploy nicely.
// Only used for truffle to create it's provider
async function readMnemonic(name: string) {
  const encrypted = readFileSync(process.env[`WALLET_${name}_PATH`]);
  const decrypted = await Wallet.fromEncryptedJson(encrypted.toString(), process.env[`WALLET_${name}_KEY`]);
  console.log(`${name}\t Address: ${decrypted.address} - ${decrypted.privateKey} - ${decrypted.mnemonic}`);
  return decrypted.mnemonic;
}

async function readRoles() {
  const contract = await GetContract();
  const roles = await contract.getRoles();
  console.log('roles: ', roles);
}
readRoles();
readMnemonic("Owner");
readMnemonic("TheCoin");
readMnemonic("Minter");
