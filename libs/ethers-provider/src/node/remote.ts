import { InfuraProvider } from "ethers";
import { Network } from '../types';
import { getSecret } from '@thecointech/secrets';

function getInfuraNetwork(deployTo: Network) {
  if (deployTo !== "POLYGON") throw new Error("Fix multi-network support");

  switch(process.env.DEPLOY_POLYGON_NETWORK)
  {
    case "polygon-testnet": return 80002; // Amoy
    case "polygon-mainnet": return "matic";
    default: return process.env.DEPLOY_POLYGON_NETWORK;
  }
};

async function getProjectId() {
  try {
    return await getSecret("InfuraProjectId");
  } catch (e) {
    // In some circumstances (CI) we do not have a projectId
    // There is a default one, so no real biggy
    return process.env.INFURA_PROJECT_ID;
  }
}

export const getProvider = async (deployTo: Network = "POLYGON") => {
  const network = getInfuraNetwork(deployTo)
  if (!network)
    throw new Error("Missing deploy network, cannot connect to blockchain");
  return new InfuraProvider(network, await getProjectId());
}

