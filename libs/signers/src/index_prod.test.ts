import { getEncryptionKey } from '@thecointech/account-details';
import { AccountId, AccountName, getSigner } from './index_prod';
import { describe } from '@thecointech/jestutils';
import { ifSecret } from '@thecointech/secrets/jestutils';
import { getEnvVars } from '@thecointech/setenv';
import { NormalizeAddress } from '@thecointech/utilities/Address';

const env = getEnvVars("prod");
const toSkip = ["TheCoin", "Owner"];
const names = Object.keys(AccountId).filter(
  (name): name is AccountName =>
    !!env[`WALLET_${name}_ADDRESS`] && !toSkip.includes(name)
);

describe('verify production signers', () => {
  it.each(names)('production signer %s matches .env address', async (name) => {
    if (env[`WALLET_${name}_ADDRESS`]) {
      const signer = await getSigner(name as AccountName);
      expect(signer).toBeDefined();
      const address = await signer.getAddress();
      expect(NormalizeAddress(address)).toEqual(env[`WALLET_${name}_ADDRESS`]!);
    }
  })

  it ('has the correct ENCKEY for BrokerCAD', async () => {
    expect(env.WALLET_BrokerCAD_ENCKEY).toBeDefined();
    const key = await getEncryptionKey(await getSigner('BrokerCAD'));
    expect(key.compressedPublicKey).toEqual(env.WALLET_BrokerCAD_ENCKEY);
  })
}, await ifSecret("SignerBrokerCADPwd", "prod"))
