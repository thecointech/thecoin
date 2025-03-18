import { getSigner } from '@thecointech/signers';
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
  if (process.env.WALLET_BrokerCAD_ADDRESS) {
    return process.env.WALLET_BrokerCAD_ADDRESS;
  }

  // In dev, we can simply load the BrokerCAD to get it's address
  const brokerCad = await getSigner('BrokerCAD');
  return brokerCad.getAddress();
}
