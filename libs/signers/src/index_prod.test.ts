import { AccountId, AccountName, getSigner } from './index_prod';
import { describe } from '@thecointech/jestutils';
import { ifSecret } from '@thecointech/secrets/jestutils';

const toSkip = ["TheCoin", "Owner"];
const names = Object.keys(AccountId).filter(
  (name): name is AccountName =>
    !!process.env[`WALLET_${name}_ADDRESS`] && !toSkip.includes(name)
);

describe('verify production signers', () => {
  it.each(names)('production signer %s matches .env address', async (name) => {
    if (process.env[`WALLET_${name}_ADDRESS`]) {
      const signer = await getSigner(name as AccountName);
      expect(signer).toBeDefined();
      const address = await signer.getAddress();
      expect(address).toEqual(process.env[`WALLET_${name}_ADDRESS`]);
    }
  })
}, await ifSecret("SignerBrokerCADPwd"))
