import { getSecret, SecretKeyType, getClient, ConfigType } from '../src/node';

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

export const IfPolygonscanLive = async (config?: ConfigType) => {
  const apiKey = await ifSecret("PolygonscanApiKey", config);
  if (apiKey) {
    process.env.POLYGONSCAN_API_KEY = apiKey;
    return true;
  }
  return false;
}

export const IfInfuraLive = async (config?: ConfigType) => {
  const apiKey = await ifSecret("InfuraProjectId", config);
  if (apiKey) {
    process.env.POLYGONSCAN_API_KEY = apiKey;
    return true;
  }
  return false;
}

