import { existsSync, readFileSync, writeFileSync, readdirSync } from 'fs';
import { storeContractAddress } from '@thecointech/contract-tools/writeContract';

const pluginCacheFile = new URL("../../ethers-provider/src/plugins.json", __dirname);
// This gawd-awful hack is how we expose plugin address & code to
// provider in dev:live mode.
export function writePlugin(root: string, address: string, contractName: string) {
  // Only write artifacts in devlive
  if (process.env.CONFIG_NAME === 'devlive')
    return;

  const rootUrl = new URL(root);
  const contractFile = findFile(rootUrl, contractName);
  if (!contractFile)
    throw new Error(`Cannot find contract: ${contractName}`);
  const code = readFileSync(contractFile, "utf-8");
  const existing = existsSync(pluginCacheFile)
   ? JSON.parse(readFileSync(pluginCacheFile, "utf-8"))
   : {}

  writeFileSync(pluginCacheFile, JSON.stringify({
    ...existing,
    [contractName]: {
      address,
      code
    }
  }));

  // Also write the contract address
  storeContractAddress(rootUrl, "polygon", address);
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
