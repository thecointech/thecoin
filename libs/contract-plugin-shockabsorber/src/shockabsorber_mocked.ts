import * as Src from '.';

export class ShockAbsorber implements Pick<Src.ShockAbsorber, 'preWithdraw'|'getAddress'> {

  address = "0xAB00000000000000000000000000000000000000";
  getAddress = () => Promise.resolve(this.address)

  preWithdraw = (() => {
    throw new Error('Method not implemented.');
  }) as any
}

export const getContract: typeof Src.getContract = () => new ShockAbsorber() as any;
export const connectConverter: typeof Src.connectShockAbsorber = () => new ShockAbsorber() as any;
