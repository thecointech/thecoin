import { getProvider } from '@thecointech/ethers-provider';
import { SpxCadOracle__factory, type SpxCadOracle } from './codegen';
import type { Provider, Signer } from 'ethers';

const getContractAddress = async () => {

  const config_env = process.env.CONFIG_ENV ?? process.env.CONFIG_NAME;
  const deployment = await import(`./deployed/${config_env}-polygon.json`, { with: { type: 'json' } });

  if (!deployment) {
    throw new Error('Cannot create contract: missing deployment');
  }
  return deployment.default.contract;
}

declare global {
  var __oracle: SpxCadOracle|undefined;
}

export async function getContract(provider?: Provider) : Promise<SpxCadOracle> {
  provider = provider ?? await getProvider();
  const v = globalThis.__oracle ??= SpxCadOracle__factory.connect(
    await getContractAddress(),
    provider
  )
  return v
}

// Expose the factory here to allow easier testing elsewhere...
export const getOracleFactory = (signer: Signer) => new SpxCadOracle__factory().connect(signer);
