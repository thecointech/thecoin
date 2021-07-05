import { getSigner } from '@thecointech/signers';
import constant from './constant.json';
import production from './production.json';
import prodtest from './prodtest.json';

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
  if (process.env.NODE_ENV === 'development') {
    // In dev live, we can simply load the BrokerCAD to get it's address
    if (process.env.SETTINGS === 'live') {
      const brokerCad = await getSigner('BrokerCAD');
      return brokerCad.getAddress();
    }
    // In dev, it doesn't matter (so just use production)
  }
  // Choose the correct account for test/prod
  else if (process.env.SETTINGS === 'testing') {
    return prodtest.BrokerCAD;
  }
  return production.BrokerCAD;
}
