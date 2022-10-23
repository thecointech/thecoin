import hre from 'hardhat';
import { PLUGINMGR_ROLE, MINTER_ROLE, BROKER_ROLE } from '../src/constants'
import { AccountId, AccountName } from "@thecointech/signers";
import { initCache } from "@thecointech/signers/cache";
import { getOracleFactory } from '@thecointech/contract-oracle/contract';
import { Signer } from '@ethersproject/abstract-signer';
import { DateTime, Duration } from 'luxon';
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import type { SpxCadOracle } from '@thecointech/contract-oracle';

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

export async function createAndInitOracle(signer: Signer, rate = 2) {
  const SpxCadOracle = getOracleFactory(signer);
  const owner = await signer.getAddress();
  const oracle = await SpxCadOracle.deploy();
  // We start our time 6 days ago at midnight with a day-long rate length
  const initialTime = DateTime
    .now()
    .set({hour:0, minute:0, second:0, millisecond:0})
    .minus({days: 6})
    .toSeconds();
  const blockTime = Duration.fromObject({day: 1}).as("seconds");
  await oracle.initialize(owner, initialTime, blockTime);
  // We a constant rate over the last week, expires tonight midnight
  await setOracleValueRepeat(oracle, rate, 7);
  return oracle;
}

export async function setOracleValueRepeat(oracle: SpxCadOracle, rate: number, days: number) {
  const tx = await oracle.bulkUpdate(new Array(days).fill(rate * 1e8));
  return await tx.wait();
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

