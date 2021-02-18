import type { CeramicApi } from '@ceramicnetwork/common'
import { IDX } from '@ceramicstudio/idx'
import config from './config.json';

const aliases = {
  secretNotes: config.definitions.notes
}

export function createIDX(ceramic: CeramicApi): IDX {
  const idx = new IDX({ ceramic, aliases })
  return idx
}
