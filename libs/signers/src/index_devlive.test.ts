import { AccountId, AccountName, getSigner } from './index_mocked';
import { getEnvVars } from '@thecointech/setenv';

const vars = getEnvVars("devlive");
const names = Object.keys(AccountId).filter(
  (name): name is AccountName =>
    !!vars[`WALLET_${name}_ADDRESS`]
);

describe('verify devlive signers', () => {
  it.each(names)('devlive signer %s matches .env address', async (name) => {
    if (vars[`WALLET_${name}_ADDRESS`]) {
      const signer = await getSigner(name as AccountName);
      expect(signer).toBeDefined();
      const address = await signer.getAddress();
      expect(address).toEqual(vars[`WALLET_${name}_ADDRESS`]);
    }
  })
})
