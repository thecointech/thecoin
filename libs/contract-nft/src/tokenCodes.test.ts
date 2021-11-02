import { Wallet } from 'ethers';
import { getTokenClaimCode, getTokenClaimAuthority } from './tokenCodes';

it ('can generate a token code', async () => {
  const auth = Wallet.createRandom();
  const code = await getTokenClaimCode(10, auth);
  // It seems base58 is not determinstic length?
  // We had 88 one run without any code changes
  expect(code.length).toBeGreaterThanOrEqual(88);
  expect(code.length).toBeLessThanOrEqual(89);
})

it ('correctly returns auth from token code', async () => {
  const auth = Wallet.createRandom();
  const code = await getTokenClaimCode(10, auth);
  const address = getTokenClaimAuthority(10, code);
  expect(address).toMatch(auth.address);
})
