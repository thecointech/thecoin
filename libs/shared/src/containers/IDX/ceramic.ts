import HttpCeramic from '@ceramicnetwork/http-client'
import type { CeramicApi } from '@ceramicnetwork/common'

// Singleton
declare module globalThis {
  let __ceramic: CeramicApi;
}

// Public URL: 'https://ceramic-clay.3boxlabs.com'
const CERAMIC_URL = process.env.CERAMIC_URL || 'http://localhost:7007'

export function Ceramic(): CeramicApi {
  globalThis.__ceramic = globalThis.__ceramic ?? new HttpCeramic(CERAMIC_URL);
  return globalThis.__ceramic;
}

