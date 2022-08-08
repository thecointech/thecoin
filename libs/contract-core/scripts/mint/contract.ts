import { AccountName, getSigner } from '@thecointech/signers';
import { ConnectContract } from '../../src';

export const getContract = async (name: AccountName) =>  ConnectContract(
  await getSigner(name)
);
