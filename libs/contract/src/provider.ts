import { providers } from "ethers";

export const getDevLiveProvider = () =>
  new providers.JsonRpcProvider("http://localhost:9545");

export const getProvider = () => {
  if (process.env.NODE_ENV === 'production') {
    // Connect through infura
    const key = process.env.INFURA_API_KEY;
    if (!key)
      throw new Error("Missing Infura Key, cannot connect to blockchain");

    // Which network do we connect to?
    // TODO: replace mainnet with
    if (process.env.SETTINGS === 'staging')
      return new providers.InfuraProvider("ropsten", key);
  }
  else {
    if (process.env.SETTINGS === 'live') {
      return getDevLiveProvider();
    }
    else {
      // For now we use ropsten for dev, at least until we have completed a fully
      // encapsulated dev environment
      return new providers.InfuraProvider("ropsten", process.env.INFURA_API_KEY);
    }
  }

  throw new Error(`Unsupported environment: ${process.env.NODE_ENV}:${process.env.SETTINGS}`);
}
