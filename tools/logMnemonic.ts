import { readFileSync } from "fs";
import { Wallet } from 'ethers';
import { GetContract } from 'contract-core
process.env.CONFIG_NAME='prodtest';
import './setenv';

// Used to read back the mnemonic so we can deploy nicely.
// Only used for truffle to create it's provider
async function readMnemonic(name: string) {
  const path = process.env[`WALLET_${name}_PATH`];
  const pwd = process.env[`WALLET_${name}_PWD`];
  const encrypted = readFileSync(path);
  const decrypted = await Wallet.fromEncryptedJson(encrypted.toString(), pwd);
  console.log(`WALLET_${name}_PATH=${path}`);
  console.log(`WALLET_${name}_PWD=${pwd}`);
  console.log(`WALLET_${name}_ADDRESS=${decrypted.address}`);
  console.log(`WALLET_${name}_KEY=${decrypted.privateKey}`);
}

async function readRoles() {
  const contract = await GetContract();
  const roles = await contract.getRoles();
  console.log('roles: ', roles);
}

(async () => {
  await readRoles();
  await readMnemonic("Owner");
  await readMnemonic("TheCoin");
  await readMnemonic("TCManager");
  await readMnemonic("Minter");
  await readMnemonic("Police");
  await readMnemonic("BrokerCAD");
  await readMnemonic("BrokerTransferAssistant");
  await readMnemonic("client1");
  await readMnemonic("client2");
  await readMnemonic("NFTMinter");
})();
