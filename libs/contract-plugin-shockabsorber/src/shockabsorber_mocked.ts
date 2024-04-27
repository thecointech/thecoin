import type { ContractTransaction } from 'ethers';
import * as Src from '.';

export class ShockAbsorber implements Pick<Src.ShockAbsorber, 'preWithdraw'> {

  address = "0xAB00000000000000000000000000000000000000";

  preWithdraw(): Promise<ContractTransaction> {
    throw new Error('Method not implemented.');
  }
}

export const getContract: typeof Src.getContract = () => new ShockAbsorber() as any;
export const connectConverter: typeof Src.connectShockAbsorber = () => new ShockAbsorber() as any;
