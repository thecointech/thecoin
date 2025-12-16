import { type SpxCadOracle, SpxCadOracle__factory } from './codegen';
import type { Signer } from 'ethers';
import { defineContractSingleton } from '@thecointech/contract-base';

const getContractAddress = async () => {

  const config_env = process.env.CONFIG_ENV ?? process.env.CONFIG_NAME;
  const deployment = await import(`./deployed/${config_env}-polygon.json`, { with: { type: 'json' } });

  if (!deployment) {
    throw new Error('Cannot create contract: missing deployment');
  }
  return deployment.default.contract;
}



export const ContractOracle = defineContractSingleton<SpxCadOracle>(
  '__oracle',
  getContractAddress,
  SpxCadOracle__factory
);

// Expose the factory here to allow easier testing elsewhere...
export const getOracleFactory = (signer: Signer) => new SpxCadOracle__factory().connect(signer);
