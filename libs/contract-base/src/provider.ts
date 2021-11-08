import { providers } from "ethers";

export const getProvider = () => {

  const network = process.env.DEPLOY_POLYGON_NETWORK == "polygon-mumbai"
    ? "maticmum"
    : process.env.DEPLOY_POLYGON_NETWORK;

  const projectId = process.env.INFURA_PROJECT_ID;
  if (!network)
    throw new Error("Missing deploy network, cannot connect to blockchain");

  if (process.env.NODE_ENV === "production" && !projectId)
    throw new Error(`Missing INFURA project ID, cannot connect to ${network}`);

  return (projectId)
    ? new providers.InfuraProvider(network, projectId)
    : new providers.JsonRpcProvider(`http://localhost:${process.env.DEPLOY_NETWORK_PORT}`);
}