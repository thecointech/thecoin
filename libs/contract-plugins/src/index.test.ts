import { getPluginDetails } from './index';
import { ConnectContract } from '../index_mocked';
import { Wallet } from '@ethersproject/wallet';
import { runModifier } from './common.test';

it ('Generates a useful modifier', async () => {
  const signer = Wallet.createRandom()
  var contract = await ConnectContract(signer);
  const [details] = await getPluginDetails(contract);
  // run the modifier
  const rfiat = runModifier(details.emulator!, 1999e2, 0);
  expect(rfiat.toNumber()).toBe(1900e2);
})