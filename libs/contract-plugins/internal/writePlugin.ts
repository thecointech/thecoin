import { existsSync, readFileSync, writeFileSync, readdirSync } from 'fs';
import { storeContractAddress } from '@thecointech/contract-tools/writeContract';
import path from 'path';

const pluginCacheFile = new URL("../../ethers-provider/src/plugins.json", import.meta.url);
const pluginBuildFile = new URL("../../ethers-provider/build/mjs/plugins.json", import.meta.url);
// This gawd-awful hack is how we expose plugin address & code to
// provider in dev:live mode.
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
    writeFileSync(pluginBuildFile, newCache);
  }
  // Always write the contract address
  storeContractAddress(contract, "polygon", address);
}



function findFile(dir: URL, fileName: string) : URL|undefined {
  const dirents = readdirSync(dir, { withFileTypes: true });
  if (dirents.find(dirent => dirent.isFile() && dirent.name.endsWith(fileName)))
    return new URL(fileName, dir);
  for (const dirent of dirents) {
    if (dirent.isDirectory()) {
      const result = findFile(new URL(dirent.name, dir), fileName);
      if (result)
        return result;
    }
  }
  return undefined;
}
