import { Provider } from 'ethers';
import { RoundNumber, RoundNumber__factory } from './codegen';
import { getProvider } from '@thecointech/ethers-provider';

const getContractAddress = async () => {

  const config_env = process.env.CONFIG_ENV ?? process.env.CONFIG_NAME;
  const deployment = await import(`./deployed/${config_env}-polygon.json`, { assert: { type: 'json' } });

  if (!deployment) {
    throw new Error('Cannot create contract: missing deployment');
  }
  return deployment.default.contract;
}

declare module globalThis {
  let __roundnumber: RoundNumber|undefined;
}

export async function getContract(provider: Provider = getProvider()) : Promise<RoundNumber> {
  return globalThis.__roundnumber ??= RoundNumber__factory.connect(
    await getContractAddress(),
    provider
  )
}
