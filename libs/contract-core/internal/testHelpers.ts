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

// This replaces the hre.ethers.getSigners() signers with
// our own explicit (HDNode) signers.
// For reasons we don't understand the original signers
// would cause errors on linux when running the uberConverter
// tests. (Error: Transaction reverted without a reason string)
// at <UnrecognizedContract>.<unknown> (0x5fbd...)
// NOTE: This appeared to improve things locally, but did
// not improve things on CI.  Leaving it this way as it seems
// like a nicer way to handle signers.
const getSignerWithAddress = async (s: AccountName) => {
  const signer = await getSigner(s);
  return signer.connect(hre.ethers.provider) as unknown as SignerWithAddress;
}

export async function getSigners() {
  const r = await Promise.all(
    Object.entries(AccountId)
      .filter(k => notNum.test(k[0]))
      .map(async ([k]) => {
        const r: [string, SignerWithAddress] = [k, await getSignerWithAddress(k as AccountName)]; return r })
  );
  const signers = r.reduce((obj, [k, v]) => { obj[k as AccountName] = v; return obj }, {} as Record<AccountName, SignerWithAddress>);
  initCache(signers);
  return signers;
}
