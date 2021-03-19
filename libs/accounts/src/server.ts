// Import the Secret Manager client and instantiate it:
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { Wallet } from 'ethers';
import { AccountName } from './names';

// Get Secrets.  Only enabled for TCCC
export async function getSecret(name: string) {
  const client = new SecretManagerServiceClient();
  const [accessResponse] = await client.accessSecretVersion({
    name: `projects/906091868238/secrets/${name}/versions/latest`,
  });

  return accessResponse.payload?.data?.toString();
}

export async function loadWallet(name: AccountName) {
  const mnemonic = await getSecret(`WALLET_${name}`);
  if (!mnemonic)
    throw new Error(`Wallet ${name} not found in secrets`);

  return Wallet.fromMnemonic(mnemonic);
}
