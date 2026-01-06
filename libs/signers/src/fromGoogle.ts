import { getSecret, type SecretKeyType } from '@thecointech/secrets';
import { Wallet } from 'ethers';
import type { AccountName } from './names';
import { getProvider } from '@thecointech/ethers-provider';

export async function loadFromGoogle(name: AccountName) {

  const privatekey = await getSecret(`WALLET_${name}_KEY` as SecretKeyType);
  if (!privatekey)
    throw new Error(`Wallet ${name} not found in secrets`);

  const wallet =  new Wallet(privatekey);
  return wallet.connect(await getProvider());
}
