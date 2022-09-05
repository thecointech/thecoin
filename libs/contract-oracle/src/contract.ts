import { Contract } from '@ethersproject/contracts';
import type { SpxCadOracle } from './types/contracts/SpxCadOracle';
import OracleSpec from './contracts/contracts/SpxCadOracle.sol/SpxCadOracle.json' assert {type: "json"};
import { getProvider } from '@thecointech/ethers-provider';

const getAbi = () => OracleSpec.abi;
const getContractAddress = async () => {

  const config_env = process.env.CONFIG_ENV ?? process.env.CONFIG_NAME;
  const deployment = await import(`./deployed/${config_env}-polygon.json`, { assert: { type: 'json' } });

  if (!deployment) {
    throw new Error('Cannot create contract: missing deployment');
  }
  return deployment.default.contract;
}

const buildContract = async () =>
  new Contract(
    await getContractAddress(),
    getAbi(),
    getProvider()
  ) as SpxCadOracle

declare module globalThis {
  let __oracle: SpxCadOracle|undefined;
}

export async function getContract() : Promise<SpxCadOracle> {
  if (!globalThis.__oracle) {
    globalThis.__oracle= await buildContract();
  }
  return globalThis.__oracle;
}
