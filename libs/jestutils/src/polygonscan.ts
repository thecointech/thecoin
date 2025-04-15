// import { getSecret, SecretKeyType, getClient } from '@thecointech/secrets/live';
// import type { ConfigType } from '@thecointech/secrets';

export const ifSecret = async (_secret: string, _config?: string) => {
  try {
    // // TODO: Break this circular reference (maybe move these jest utils into secrets?....)
    // const { getSecret, getClient } = await import('@thecointech/secrets/live');
    // // const ype { ConfigType } from '@thecointech/secrets';

    // //@ts-ignore Initialize client first
    // await getClient(config ?? "prodtest");
    // //@ts-ignore then get key
    // return await getSecret(secret);
    return false
  }
  catch(e) {
    return false;
  }
}

export const IfPolygonscanLive = async (config?: string) => {
  const apiKey = await ifSecret("PolygonscanApiKey", config);
  if (apiKey) {
    // process.env.POLYGONSCAN_API_KEY = apiKey;
    // return true;
  }
  return false;
}
