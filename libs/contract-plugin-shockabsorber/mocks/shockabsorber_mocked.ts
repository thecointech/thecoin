import * as Src from '../src';
import { defineContractBaseSingleton } from '@thecointech/contract-base';

export class ShockAbsorber implements Pick<Src.ShockAbsorber, 'preWithdraw'|'getAddress'> {

  address = "0xAB00000000000000000000000000000000000000";
  getAddress = () => Promise.resolve(this.address)

  preWithdraw = (() => {
    throw new Error('Method not implemented.');
  }) as any
}

export const ContractShockAbsorber = defineContractBaseSingleton<Src.ShockAbsorber>(
  '__shockabsorber',
  async () => new ShockAbsorber() as any,
)
