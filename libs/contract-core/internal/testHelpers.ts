import { PLUGINMGR_ROLE, MINTER_ROLE, BROKER_ROLE } from '../src/constants'
import { AccountId, AccountName, getSigner } from "@thecointech/signers";
import { initCache } from "@thecointech/signers/cache";
import type { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/dist/src/signer-with-address";
import { TheCoin__factory } from '../src/codegen/factories/contracts';
import hre from 'hardhat';

// Basic function to create & init TheCoin contract with all roles set to address
export async function createAndInitTheCoin(signer: SignerWithAddress) {

  const TheCoin = new TheCoin__factory(signer);
  const tcCore = await TheCoin.deploy();

  await tcCore.initialize(signer.address);
  await tcCore.grantRole(MINTER_ROLE, signer.address);
  await tcCore.grantRole(PLUGINMGR_ROLE, signer.address);
  await tcCore.grantRole(BROKER_ROLE, signer.address);
  return tcCore;
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

const getSignerWithAddress = async (s: AccountName) => {
  const signer = await getSigner(s);
  return signer.connect(hre.ethers.provider) as unknown as SignerWithAddress;
}

export async function getSigners() {
  const Owner = await getSignerWithAddress("Owner");
  const OracleUpdater = await getSignerWithAddress("OracleUpdater");
  const Client1 = await getSignerWithAddress("Client1");
  const Client2 = await getSignerWithAddress("Client2");
  const BrokerCAD = await getSignerWithAddress("BrokerCAD");
  return {
    Owner,
    OracleUpdater,
    Client1,
    Client2,
    BrokerCAD
  };
}
