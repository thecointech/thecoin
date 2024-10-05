import { AccountName, getSigner } from '@thecointech/signers';
import { ConnectContract } from '../../src';

export const getContract = async (name: AccountName) => {
  const signer = await getSigner(name);
  return {
    signer,
    tcCore: await ConnectContract(signer)
  }
}
