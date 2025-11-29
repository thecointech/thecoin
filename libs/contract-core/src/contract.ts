import { Provider } from 'ethers';
import { TheCoin, TheCoin__factory } from './codegen';
import { getProvider } from '@thecointech/ethers-provider';

//
// Ensure your .env specifies where this contract was deployed at
// (used in fetching history to prevent searching too far back!)
export const InitialCoinBlock = parseInt(process.env.INITIAL_COIN_BLOCK ?? "0", 10);

export const getContractAddress = async () : Promise<string> => {

  const config_env = process.env.CONFIG_ENV ?? process.env.CONFIG_NAME;
  const deployment = await import(`./deployed/${config_env}-polygon.json`, { with: { type: 'json' } });

  if (!deployment) {
    throw new Error('Cannot create contract: missing deployment');
  }
  return deployment.default.contract;
}

declare global {
  var __contract: TheCoin|undefined;
}

export async function GetContract(provider?: Provider) : Promise<TheCoin> {
  provider = provider ?? await getProvider();
  const v = globalThis.__contract ??= TheCoin__factory.connect(
    await getContractAddress(),
    provider
  );
  // Security check - we should -never- try to create a contract with different
  // networks, but just in case...
  if (process.env.NODE_ENV == "development" || process.env.RUNTIME_ENV == "test") {
    const running = await v.runner?.provider?.getNetwork();
    const passed = await provider.getNetwork();
    if (running?.chainId != passed.chainId) {
      throw new Error("Mismatched network");
    }
  }
  return v;
}
