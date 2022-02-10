import { InfuraProvider } from "@ethersproject/providers";

function getInfuraNetwork(deployTo: "POLYGON"|"ETHERUM") {
  switch(process.env[`DEPLOY_${deployTo}_NETWORK`])
  {
    case "polygon-testnet": return "maticmum";
    case "polygon-mainnet": return "matic";
    default: return process.env[`DEPLOY_${deployTo}_NETWORK`];
  }
};

export const getProvider = (deployTo: "POLYGON"|"ETHERUM"="POLYGON") => {
  const network = getInfuraNetwork(deployTo)
  if (!network)
    throw new Error("Missing deploy network, cannot connect to blockchain");

  const projectId = process.env.INFURA_PROJECT_ID;
  if (!projectId)
    throw new Error(`Missing INFURA project ID, cannot connect to ${network}`);

  return new InfuraProvider(network, projectId);
}
