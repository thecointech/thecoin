import { getSigner } from '@thecointech/signers';
import { TheCoinL1Instance, TheCoinL2Instance } from '../types/index';
import { getContractL1 } from './deploy_L1'
import { getContractL2 } from './deploy_L2'

export type TheCoin = TheCoinL1Instance|TheCoinL2Instance
let deployed: TheCoin | undefined = undefined;
export async function getContract(deployer: Truffle.Deployer, network: String) {
  if (!deployed) {
    const theCoin = await getSigner("TheCoin");
    const theCoinAddress = await theCoin.getAddress();
    deployed = network === 'polygon'
      ? await getContractL2(deployer, theCoinAddress)
      : await getContractL1(deployer, theCoinAddress);
  }
  return deployed!;
}
