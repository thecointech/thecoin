import { Wallet } from 'ethers';
import { getGasslessSigner, signGasslessUpdate } from './gassless';

it ('creates a valid gassless update', async () => {
  const signer = Wallet.createRandom();
  const request = await signGasslessUpdate(signer, 100, 100, "0x1220", "0x".padEnd(66, "0"));
  const address = getGasslessSigner(request);
  expect(address).toMatch(signer.address);
})
