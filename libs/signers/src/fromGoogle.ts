import { getGoogleSecret } from '@thecointech/secrets-google';
import { Wallet } from 'ethers';
import type { AccountName } from './names';
import { getProvider } from '@thecointech/ethers-provider';

export async function loadFromGoogle(name: AccountName) {

  const privatekey = await getGoogleSecret(`WALLET_${name}_KEY`);
  if (!privatekey)
    throw new Error(`Wallet ${name} not found in secrets`);

  const wallet =  new Wallet(privatekey);
  return wallet.connect(await getProvider());
}
