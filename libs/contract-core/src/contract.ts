import { type TheCoin as TcContract, TheCoin__factory } from './codegen';
import { defineContractSingleton } from '@thecointech/contract-base';

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

export const ContractCore = defineContractSingleton<TcContract>(
  '__theCoin',
  getContractAddress,
  TheCoin__factory
);
