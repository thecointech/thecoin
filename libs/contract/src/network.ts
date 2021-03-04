export type Network = "development"|"ropsten"|"mainnet";

export const getNetwork = () : Network =>
  process.env.NODE_ENV === 'production'
    ? process.env.SETTINGS === 'staging'
      ? "ropsten"
      : "mainnet"
    : "development";
