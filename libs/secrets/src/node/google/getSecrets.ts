
import { SecretNotFoundError } from '../../errors';
import { SecretKeyType } from '../../types';
import { getClient } from './client';

// Get Secrets from Google Secrets Manager.  Currently only used on TCCC Broker
export async function getGoogleSecret(name: SecretKeyType) {
  // NOTE: If the below throws due to permissions,
  // try logging into gcloud:
  // `gcloud auth application-default login`
  const client = await getClient();

  const projectId = process.env.GAE_LONG_APP_ID;
  if (!projectId) {
    throw new Error("GAE_LONG_APP_ID not set");
  }
  const [accessResponse] = await client.accessSecretVersion({
    name: `projects/${projectId}/secrets/${name}/versions/latest`,
  });
  const r = accessResponse.payload?.data?.toString();
  if (!r) {
    throw new SecretNotFoundError(name);
  }
  return r;
}
