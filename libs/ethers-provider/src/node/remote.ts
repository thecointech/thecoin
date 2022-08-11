import { InfuraProvider } from "@ethersproject/providers";
import { Network } from '../types';
import { log } from '@thecointech/logging';

function getInfuraNetwork(deployTo: Network) {
  switch(process.env[`DEPLOY_${deployTo}_NETWORK`])
  {
    case "polygon-testnet": return "maticmum";
    case "polygon-mainnet": return "matic";
    default: return process.env[`DEPLOY_${deployTo}_NETWORK`];
  }
};

export const getProvider = (deployTo: Network = "POLYGON") => {
  const network = getInfuraNetwork(deployTo)
  if (!network)
    throw new Error("Missing deploy network, cannot connect to blockchain");

  const projectId = process.env.INFURA_PROJECT_ID;
  if (!projectId)
    log.warn(`Missing INFURA project ID, cannot connect to ${network}`);

  return new InfuraProvider(network, projectId);
}
