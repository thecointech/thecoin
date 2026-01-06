import { readFileSync } from "fs";
import { Wallet } from 'ethers';
import { BROKER_ROLE, ContractCore, MINTER_ROLE, MRFREEZE_ROLE, PLUGINMGR_ROLE, THECOIN_ROLE } from '@thecointech/contract-core'
import { AccountId } from '@thecointech/signers';

// Used to read back the mnemonic so we can deploy nicely.
async function readMnemonic(name: string) {
  const path = process.env[`WALLET_${name}_PATH`];
  const pwd = process.env[`WALLET_${name}_PWD`];
  if (!path || !pwd) {
    console.log(`Wallet ${name} not configured`);
    return;
  }
  const encrypted = readFileSync(path);
  const decrypted = await Wallet.fromEncryptedJson(encrypted.toString(), pwd);
  console.log(`WALLET_${name}_PATH=${path}`);
  console.log(`WALLET_${name}_PWD=${pwd}`);
  console.log(`WALLET_${name}_ADDRESS=${decrypted.address}`);
  console.log(`WALLET_${name}_KEY=${decrypted.privateKey}`);
}

const contract = await ContractCore.get();
async function getRoles(name: string, role: string) {
  const numRoles = await contract.getRoleMemberCount(role);
  console.log(`${name} has ${numRoles} members`);
  for (let i = 0n; i < numRoles; i++) {
    const address = await contract.getRoleMember(role, i);
    console.log(`${i}: ${address}`);
  }
}

await getRoles("TheCoin", THECOIN_ROLE);
await getRoles("Broker", BROKER_ROLE);
await getRoles("Minter", MINTER_ROLE);
await getRoles("MrFreeze", MRFREEZE_ROLE);
await getRoles("PluginMgr", PLUGINMGR_ROLE);

for (const name in AccountId) {
  if(!/^\d+$/.test(name)) {
    await readMnemonic(name);
  }
}
