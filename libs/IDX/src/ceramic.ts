import { CeramicClient } from '@ceramicnetwork/http-client'

// Singleton
declare module globalThis {
  let __ceramic: CeramicClient;
}

const CERAMIC_URL = process.env.CERAMIC_URL;
export function Ceramic(): CeramicClient {
  globalThis.__ceramic = globalThis.__ceramic ?? new CeramicClient(CERAMIC_URL);
  return globalThis.__ceramic;
}

