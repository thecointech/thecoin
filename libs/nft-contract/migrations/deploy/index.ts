import { getSigner } from '@thecointech/signers';
import { TheGreenNFTL1Instance, TheGreenNFTL2Instance } from '../types';
import {getContractL1} from './deploy_L1'
import {getContractL2} from './deploy_L2'

let deployed: TheGreenNFTL2Instance|TheGreenNFTL1Instance|undefined = undefined;
export async function getContract(deployer: Truffle.Deployer, network: String) {
  if (!deployed) {
    const minter = await getSigner("NFTMinter");
    const minterAddress = await minter.getAddress();
    deployed = network === 'polygon'
      ? await getContractL2(deployer, minterAddress)
      : await getContractL1(deployer, minterAddress);
  }
  return deployed!;
}
