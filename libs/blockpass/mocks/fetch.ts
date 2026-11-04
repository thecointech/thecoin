import { log } from '@thecointech/logging';
import type { BlockpassData } from '@thecointech/blockpass/types';

export async function fetchUser(address: string): Promise<BlockpassData> {
  log.info("Returning mocked data for " + address);
  const store = globalThis as typeof globalThis & { __BP_CLIENTDATA?: Map<string, BlockpassData> };
  const data = store.__BP_CLIENTDATA?.get(address.toLowerCase());
  if (!data) throw new Error(`Cannot fetch blockpass data for ${address}`);
  return structuredClone(data);
}
