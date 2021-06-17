import HttpCeramic from '@ceramicnetwork/http-client'
import type { CeramicApi } from '@ceramicnetwork/common'

// Singleton
declare module globalThis {
  let __ceramic: CeramicApi;
}

const CERAMIC_URL = process.env.CERAMIC_API;
export function Ceramic(): CeramicApi {
  globalThis.__ceramic = globalThis.__ceramic ?? new HttpCeramic(CERAMIC_URL);
  return globalThis.__ceramic;
}

