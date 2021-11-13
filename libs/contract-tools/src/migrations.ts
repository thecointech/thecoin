import { existsSync, mkdirSync, writeFileSync } from 'fs';
import path from 'path';


function writeContractFile(root: string, dest: string, network: string, address: string) {
  const outdir = path.join(root, '..', dest, 'deployed');
  if (!existsSync(outdir))
    mkdirSync(outdir);

  // Our contract-specific data (eg impl address, ProxyAdmin address etc) is in ../.openzeppelin/{network}.json
  const jsonFile = path.join(outdir, `${process.env.CONFIG_NAME}-${network}.json`);
  writeFileSync(jsonFile, JSON.stringify({
    contract: address,
  }))
}

export function storeContractAddress(root: string, network: string, address: string, buildConfigs?: string[]) {
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
