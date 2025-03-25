import type { Provider } from 'ethers';
import type { UberConverter } from './codegen/contracts/UberConverter';
import { getProvider } from '@thecointech/ethers-provider';
import { UberConverter__factory } from './codegen';

const getContractAddress = async () => {

  const config_env = process.env.CONFIG_ENV ?? process.env.CONFIG_NAME;
  const deployment = await import(`./deployed/${config_env}-polygon.json`, { with: { type: 'json' } });

  if (!deployment) {
    throw new Error('Cannot create contract: missing deployment');
  }
  return deployment.default.contract;
}

declare module globalThis {
  let __uberConverter: UberConverter|undefined;
}

export async function getContract(provider?: Provider) : Promise<UberConverter> {
  provider = provider ?? (await getProvider());
  return globalThis.__uberConverter ??= UberConverter__factory.connect(
    await getContractAddress(),
    provider
  )
}
