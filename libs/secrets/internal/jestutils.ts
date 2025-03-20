import { getSecret, SecretKeyType, getClient, ConfigType, SecretClientEnvNotFound, SecretClientKeyNotFound } from '../src/node';

export const ifSecret = async (secret: SecretKeyType, config?: ConfigType) => {
  try {
    // Initialize client first
    await getClient(config ?? "prodtest");
    // then get key
    return await getSecret(secret);
  }
  catch(e) {
    return false;
  }
}

export const loadSecrets = async (secrets: SecretKeyType[], config: ConfigType = "prodtest") => {
  // Initialize client first
  try {
    await getClient(config);
  }
  catch(e) {
    // If we don't have access to secrets, just return false.
    if (e instanceof SecretClientEnvNotFound || e instanceof SecretClientKeyNotFound) {
      return false;
    }
    // Don't know what this error is - rethrow it.
    throw e;
  }
  for (const secret of secrets) {
    const loaded = await getSecret(secret);
    if (!globalThis.__loadedSecrets) {
      globalThis.__loadedSecrets = {};
    }
    if (loaded) {
      globalThis.__loadedSecrets[secret] = loaded;
    }
  }
  return true;
}

// Shortcut for a common use case
export const ifPolygonscan = async (config?: ConfigType) => loadSecrets(["PolygonscanApiKey"], config);
