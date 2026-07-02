import * as Src from '../src';
import { defineContractBaseSingleton } from '@thecointech/contract-base';

const MOCK_ADDRESS = "0xAB00000000000000000000000000000000000000";

export class ShockAbsorber implements Pick<Src.ShockAbsorber, 'preWithdraw'|'getAddress'> {

  getAddress = () => Promise.resolve(MOCK_ADDRESS)

  preWithdraw = (() => {
    throw new Error('Method not implemented.');
  }) as any
}

export const ContractShockAbsorber = defineContractBaseSingleton<Src.ShockAbsorber>(
  '__shockabsorber',
  async () => new ShockAbsorber() as any,
)

export function getContractAddress() {
  return MOCK_ADDRESS;
}