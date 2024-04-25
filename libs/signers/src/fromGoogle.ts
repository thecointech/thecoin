import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { Wallet } from 'ethers';
import type { AccountName } from './names';

// If running on GAE, check in secrets manager
const PrivilegedEnv = () => process.env["GAE_ENV"] || process.env["GOOGLE_APPLICATION_CREDENTIALS"];

// Get Secrets.  Currently only used on TCCC Broker
export async function getSecret(name: string) {
  if (!PrivilegedEnv())
    throw new Error('Cannot get signer outside PrivilegedEnv');
  const client = new SecretManagerServiceClient();
  const [accessResponse] = await client.accessSecretVersion({
    name: `projects/${process.env.GOOGLE_CLOUD_PROJECT}/secrets/${name}/versions/latest`,
  });
  return accessResponse.payload?.data?.toString();
}

export async function loadFromGoogle(name: AccountName) {

  const privatekey = await getSecret(`WALLET_${name}_KEY`);
  if (!privatekey)
    throw new Error(`Wallet ${name} not found in secrets`);

  return new Wallet(privatekey);
}
