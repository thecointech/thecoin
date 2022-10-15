import { PLUGINMGR_ROLE, MINTER_ROLE, BROKER_ROLE } from '../src/constants'
import { AccountId, AccountName } from "@thecointech/signers";
import { initCache } from "@thecointech/signers/cache";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import hre from 'hardhat';

// Basic function to create & init TheCoin contract with all roles set to address
export async function  createAndInitTheCoin() {

  const TheCoin = await hre.ethers.getContractFactory("TheCoin");
  const tcCore = await TheCoin.deploy();

  const signer = tcCore.signer;
  const address = await signer.getAddress();
  await tcCore.initialize(address);
  await tcCore.grantRole(MINTER_ROLE, address);
  await tcCore.grantRole(PLUGINMGR_ROLE, address);
  await tcCore.grantRole(BROKER_ROLE, address);
  return tcCore;
}

export async function createAndInitOracle() {
  const SpxCadOracle = await hre.ethers.getContractFactory('SpxCadOracle');

  // price feed init to constant $1.00
  const oracle = await SpxCadOracle.deploy();
  await oracle.initialize(0, 1e13, [1e8]);
  return oracle;
}

const notNum = /^\D+/;
export const initAccounts = (accounts: SignerWithAddress[]) => {
  const r = Object.entries(AccountId)
    .filter(k => notNum.test(k[0]))
    .map(([k, v]) => { const r: [string, SignerWithAddress] = [k, accounts[v as number]]; return r })
    .reduce((obj, [k, v]) => { obj[k as AccountName] = v; return obj }, {} as Record<AccountName, SignerWithAddress>)
  initCache(r);
  return r;
}

