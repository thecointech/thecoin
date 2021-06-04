import { providers } from "ethers";

export const getProvider = () => {

  if (!process.env.DEPLOY_NETWORK)
    throw new Error("Missing deploy network, cannot connect to blockchain");

  if (process.env.NODE_ENV === "production" && !process.env.INFURA_PROJECT_ID)
    throw new Error(`Missing INFURA project ID, cannot connect to ${process.env.DEPLOY_NETWORK}`);

  return (process.env.INFURA_PROJECT_ID)
    ? new providers.InfuraProvider(process.env.DEPLOY_NETWORK, process.env.INFURA_PROJECT_ID)
    : new providers.JsonRpcProvider(`http://localhost:${process.env.DEPLOY_NETWORK_PORT}`);
}
