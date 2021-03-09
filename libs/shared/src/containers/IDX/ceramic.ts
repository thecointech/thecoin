import HttpCeramic from '@ceramicnetwork/http-client'
import type { CeramicApi } from '@ceramicnetwork/common'

// Singleton
declare module globalThis {
  let __ceramic: CeramicApi;
}

// TODO: Why isn't this in an environment variable?
const publicURL = 'https://ceramic-clay.3boxlabs.com'
const CERAMIC_URL = process.env.NODE_ENV === 'production'
  ? publicURL
  : process.env.SETTINGS === 'live'
    ? 'http://localhost:7007'
    : publicURL

export function Ceramic(): CeramicApi {
  globalThis.__ceramic = globalThis.__ceramic ?? new HttpCeramic(CERAMIC_URL);
  return globalThis.__ceramic;
}

