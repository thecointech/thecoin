// Import the Secret Manager client and instantiate it:
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { AccountName } from '@the-coin/contract';
import { Wallet } from 'ethers';

export async function getSecret(name: string) {
  const client = new SecretManagerServiceClient();
  // Access the secret.
  const [accessResponse] = await client.accessSecretVersion({
    name,
  });

  const responsePayload = accessResponse.payload?.data?.toString();
  return responsePayload;

}

export async function loadWallet(name: AccountName) {
  const mnemonic = await getSecret(`WALLET_${name}`);
  if (!mnemonic)
    throw new Error(`Wallet ${name} not found in secrets`);

  return Wallet.fromMnemonic(mnemonic);
}
