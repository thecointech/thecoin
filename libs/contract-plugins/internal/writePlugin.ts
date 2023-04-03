import { existsSync, readFileSync, writeFileSync, readdirSync } from 'fs';
import { storeContractAddress } from '@thecointech/contract-tools/writeContract';
import path from 'path';

const pluginCacheFile = new URL("../static/deployed.json", import.meta.url);
// This gawd-awful hack is how we expose plugin address & code to
// provider in dev:live mode.  The file is served from `/plugins/deployed.json`
export function writePlugin(address: string, contract: URL) {
  // Only write artifacts in devlive
  if (process.env.CONFIG_NAME === 'devlive') {
    const code = readFileSync(contract, "utf-8");
    const existing = existsSync(pluginCacheFile)
      ? JSON.parse(readFileSync(pluginCacheFile, "utf-8"))
      : {};

    const contractPath = path.parse(contract.pathname);
    const newCache = JSON.stringify({
      ...existing,
      [contractPath.name]: {
        address,
        code
      }
    })
    writeFileSync(pluginCacheFile, newCache);
  }
  // Always write the contract address
  storeContractAddress(contract, "polygon", address);
}
