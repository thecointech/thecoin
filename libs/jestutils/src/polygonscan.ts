import { getSecret, getClient } from '@thecointech/secrets/live';

export const IfPolygonscanLive = async (config?: string) => {
  try {
    // Initialize client first
    await getClient(config ?? "prodtest" as any);
    // then get key
    const apiKey = await getSecret("PolygonscanApiKey");
    process.env.POLYGONSCAN_API_KEY = apiKey;
    return true;
  }
  catch(e) {
    return false;
  }
}
