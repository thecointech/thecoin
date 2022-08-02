import { getSigner } from '../signers';
import { TheGreenNFTL1Instance, TheGreenNFTL2Instance } from '../types/index';
import { getContractL1 } from './deploy_L1'
import { getContractL2 } from './deploy_L2'

declare global {
  var deployed: TheGreenNFTL2Instance | TheGreenNFTL1Instance | undefined;
}

export async function getContract(deployer: Truffle.Deployer, network: String) {
  if (!globalThis.deployed) {
    const minter = await getSigner("NFTMinter");
    const minterAddress = await minter.getAddress();
    const contract = network === 'polygon'
      ? await getContractL2(deployer, minterAddress)
      : await getContractL1(deployer, minterAddress);


      globalThis.deployed = contract;
  }
  return globalThis.deployed!;
}
