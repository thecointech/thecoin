import { type RoundNumber, RoundNumber__factory } from './codegen';
import { defineContractSingleton } from '@thecointech/contract-base';

const getContractAddress = async () => {

  const config_env = process.env.CONFIG_ENV ?? process.env.CONFIG_NAME;
  const deployment = await import(`./deployed/${config_env}-polygon.json`, { with: { type: 'json' } });

  if (!deployment) {
    throw new Error('Cannot create contract: missing deployment');
  }
  return deployment.default.contract;
}


export const ContractRoundNumber = defineContractSingleton<RoundNumber>(
  '__roundnumber',
  getContractAddress,
  RoundNumber__factory
);
