import { AccountId, AccountName, getSigner } from './index_mocked';
import { getEncryptionKey } from '@thecointech/account-details';

const names = Object.keys(AccountId).filter(
  (name): name is AccountName =>
    !!process.env[`WALLET_${name}_ADDRESS`]
);

describe('verify mocked signers', () => {
  it.each(names)('mocked signer %s matches .env address', async (name) => {
    if (process.env[`WALLET_${name}_ADDRESS`]) {
      const signer = await getSigner(name as AccountName);
      expect(signer).toBeDefined();
      const address = await signer.getAddress();
      expect(address).toEqual(process.env[`WALLET_${name}_ADDRESS`]);
    }
  })

  it ('has the correct ENCKEY for BrokerCAD', async () => {
    expect(process.env.WALLET_BrokerCAD_ENCKEY).toBeDefined();
    const key = await getEncryptionKey(await getSigner('BrokerCAD'));
    expect(key.compressedPublicKey).toEqual(process.env.WALLET_BrokerCAD_ENCKEY);
  })
})
