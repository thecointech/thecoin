import { AccountId, AccountName, getSigner } from './index_mocked';

it ('mocked signers match .env address', async () => {
  for (const name in AccountId) {
    if (typeof AccountId[name] !== 'number') continue;

    if (process.env[`WALLET_${name}_ADDRESS`]) {
      const signer = await getSigner(name as AccountName);
      expect(signer).toBeDefined();
      const address = await signer.getAddress();
      expect(address).toEqual(process.env[`WALLET_${name}_ADDRESS`]);
    }
  }
})
