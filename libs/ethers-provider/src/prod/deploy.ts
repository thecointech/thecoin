import { InfuraProvider } from "@ethersproject/providers";

export const deployProvider = (deployTo: "POLYGON"|"ETHERUM") => {
  const network = process.env[`DEPLOY_${deployTo}_NETWORK`]
  if (!network)
    throw new Error("Missing deploy network, cannot connect to blockchain");

  const projectId = process.env.INFURA_PROJECT_ID;
  if (!projectId)
    throw new Error(`Missing INFURA project ID, cannot connect to ${network}`);

  return new InfuraProvider(
    network == "polygon-testnet"
      ? "maticmum"
      : network,
    projectId
  );
}
