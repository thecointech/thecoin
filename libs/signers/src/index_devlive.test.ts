import { describe } from '@thecointech/jestutils'
import { getEncryptionKey } from '@thecointech/account-details';
import { AccountId, AccountName, getSigner } from './index_devlive';
import { getEnvVars } from '@thecointech/setenv';
import { NormalizeAddress } from '@thecointech/utilities/Address';

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
      expect(NormalizeAddress(address)).toEqual(vars[`WALLET_${name}_ADDRESS`]);
    }
  })

  it ('has the correct ENCKEY for BrokerCAD', async () => {
    expect(vars.WALLET_BrokerCAD_ENCKEY).toBeDefined();
    const key = await getEncryptionKey(await getSigner('BrokerCAD'));
    expect(key.compressedPublicKey).toEqual(vars.WALLET_BrokerCAD_ENCKEY);
  })
  // Only run tests if emulator is running
}, !!process.env.DEPLOY_NETWORK_PORT)
