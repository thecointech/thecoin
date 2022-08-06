import { existsSync, mkdirSync, writeFileSync } from 'fs';
import path from 'path';


function writeContractFile(root: URL, dest: string, network: string, address: string) {
  const outdir = new URL(`../${dest}/deployed/`, root);
  if (!existsSync(outdir))
    mkdirSync(outdir);

  // Our contract-specific data (eg impl address, ProxyAdmin address etc) is in ../.openzeppelin/{network}.json
  const jsonFile = new URL(`${process.env.CONFIG_NAME}-${network}.json`, outdir);
  writeFileSync(jsonFile, JSON.stringify({
    contract: address,
  }))
}

export function storeContractAddress(root: URL, network: string, address: string, buildConfigs?: string[]) {
  // Never write artifacts in development
  if (process.env.CONFIG_NAME === 'development')
    return;

  writeContractFile(root, 'src', network, address);
  // Our build system seems to be failing to pick up
  // the changes to the address in repeated build steps.
  // We end-run around the problem by also writing the output
  // directly to the build folder as well.
  const outDirs = buildConfigs?.map(c => path.join('build', c)) ?? ['build'];
  outDirs.forEach(dir => {
    writeContractFile(root, dir, network, address);
  })
}
