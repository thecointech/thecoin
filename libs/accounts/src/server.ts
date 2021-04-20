// Import the Secret Manager client and instantiate it:
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { Wallet } from 'ethers';
import { AccountName } from './names';

// Get Secrets.  Currently only used on TCCC Broker
export async function getSecret(name: string) {
  const client = new SecretManagerServiceClient();
  const [accessResponse] = await client.accessSecretVersion({
    name: `projects/${process.env.GOOGLE_CLOUD_PROJECT}/secrets/${name}/versions/latest`,
  });

  return accessResponse.payload?.data?.toString();
}

export async function loadWallet(name: AccountName) {
  const privatekey = await getSecret(`WALLET_${name}_KEY`);
  if (!privatekey)
    throw new Error(`Wallet ${name} not found in secrets`);

  return new Wallet(privatekey);
}
