import { InfuraProvider } from "@ethersproject/providers";
import { Network } from '../types';

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

  // In some circumstances (CI) we do not have a projectId
  // There is a default one, so no real biggy
  const projectId = process.env.INFURA_PROJECT_ID;
  return new InfuraProvider(network, projectId);
}
