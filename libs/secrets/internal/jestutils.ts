import { getSecret, SecretKeyType, getClient, ConfigType, SecretClientEnvNotFound, SecretClientKeyNotFound } from '../src/node';
import { beforeEach, afterAll } from '@jest/globals';
import { getEnvVars } from "@thecointech/setenv";

export const ifSecrets = async (secrets: SecretKeyType[], config: ConfigType = "prodtest"): Promise<boolean> => {
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
    const loaded = await getSecret(secret, config);
    if (!globalThis.__loadedSecrets) {
      globalThis.__loadedSecrets = {};
      // Also load the environment for this config
      const envVars = {
        ...process.env,
        ...getEnvVars(config),
      };
      const OLD_ENV = process.env;
      beforeEach(() => process.env = envVars);
      afterAll(() => process.env = OLD_ENV);
    }
    if (loaded) {
      globalThis.__loadedSecrets[secret] = loaded;
    }
  }
  return true;
}

// Shortcut for a common use case
export const ifSecret = async (secret: SecretKeyType, config?: ConfigType) => ifSecrets([secret], config);
export const ifPolygonscan = async (config?: ConfigType) => ifSecret("PolygonscanApiKey", config);
