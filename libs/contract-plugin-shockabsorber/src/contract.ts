import type { ShockAbsorber } from './codegen/contracts/ShockAbsorber';
import { getProvider } from '@thecointech/ethers-provider';
import type { Provider } from 'ethers';
import { ShockAbsorber__factory } from './codegen';

const getContractAddress = async () => {

  const config_env = process.env.CONFIG_ENV ?? process.env.CONFIG_NAME;
  const deployment = await import(`./deployed/${config_env}-polygon.json`, { with: { type: 'json' } });

  if (!deployment) {
    throw new Error('Cannot create contract: missing deployment');
  }
  return deployment.default.contract;
}


declare global {
  var __shockAbsorber: ShockAbsorber|undefined;
}

export async function getContract(provider?: Provider) : Promise<ShockAbsorber> {
  provider = provider ?? (await getProvider());
  return globalThis.__shockAbsorber ??= ShockAbsorber__factory.connect(
    await getContractAddress(),
    provider
  );
}
