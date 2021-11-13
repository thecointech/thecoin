import { TheGreenNFTL1Contract } from '../types/TheGreenNFTL1';

export async function getContractL1(deployer: Truffle.Deployer, mintAddress: string) {
  // Create with minter assigned.
  const L1Contract : TheGreenNFTL1Contract = artifacts.require("TheGreenNFTL1");
  // The address of the Goerli bridge contract
  const goerliPredicate = '0x56E14C4C1748a818a5564D33cF774c59EB3eDF59';
  await deployer.deploy(L1Contract, mintAddress, goerliPredicate);
  return L1Contract.deployed()
}
