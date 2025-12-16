import type { Signer } from "ethers";

export const SIGNER_CHANNEL = 'TcBridgeSigner';

export type GetSignerCallback = (id: string) => Promise<Signer|undefined>;

export type Invoker = {
  invoke: (signerId: string, fn: string, ...args: any[]) => Promise<any>
}
