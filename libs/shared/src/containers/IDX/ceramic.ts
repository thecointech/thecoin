import Ceramic from '@ceramicnetwork/http-client'
import type { CeramicApi } from '@ceramicnetwork/common'

// declare global {
//   interface Window {
//     ceramic?: CeramicApi
//   }
// }

// Public URL: 'https://ceramic-clay.3boxlabs.com'
const CERAMIC_URL = 'http://localhost:7007'

export async function createCeramic(): Promise<CeramicApi> {
  const ceramic = new Ceramic(CERAMIC_URL)
  //window.ceramic = ceramic
  return Promise.resolve(ceramic as CeramicApi)
}
