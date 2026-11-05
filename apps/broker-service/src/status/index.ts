import { NormalizeAddress } from '@thecointech/utilities/Address';
import constant from './constant.json' with { type: "json" }

type Status = {
  certifiedFee: number,
  BrokerCAD: string,
}
export async function current() : Promise<Status> {
  return {
    BrokerCAD: await getBrokerCADAddress(),
    ...constant,
  }
}

export async function getBrokerCADAddress() {
  if (!process.env.WALLET_BrokerCAD_ADDRESS) {
    throw new Error("WALLET_BrokerCAD_ADDRESS not set");
  }
  return NormalizeAddress(process.env.WALLET_BrokerCAD_ADDRESS);
}
