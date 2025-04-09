
import { SecretNotFoundError } from '../../errors';
import { SecretKeyType } from '../../types';
import { getClient } from './client';

// Get Secrets from Google Secrets Manager.  Currently only used on TCCC Broker
export async function getGoogleSecret(name: SecretKeyType) {
  // NOTE: If the below throws due to permissions,
  // try logging into gcloud:
  // `gcloud auth application-default login`
  const client = await getClient();

  if (!globalThis.__tc_project) {
    throw new Error("Google client not initialized");
  }
  const [accessResponse] = await client.accessSecretVersion({
    name: `projects/${globalThis.__tc_project}/secrets/${name}/versions/latest`,
  });
  const r = accessResponse.payload?.data?.toString();
  if (!r) {
    throw new SecretNotFoundError(name);
  }
  return r;
}
