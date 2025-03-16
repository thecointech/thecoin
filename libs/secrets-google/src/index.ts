import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

// Get Secrets from Google Secrets Manager.  Currently only used on TCCC Broker
export async function getGoogleSecret(name: string, projectId?: string) {
  // NOTE: If the below throws due to permissions,
  // try logging into gcloud:
  // `gcloud auth application-default login`
  const client = new SecretManagerServiceClient();
  const _projectId = projectId || process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_APP_CONFIG;
  const [accessResponse] = await client.accessSecretVersion({
    name: `projects/${_projectId}/secrets/${name}/versions/latest`,
  });
  return accessResponse.payload?.data?.toString();
}