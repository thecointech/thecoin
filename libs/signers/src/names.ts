import { Signer, Wallet } from "ethers";

export enum AccountId {
  Owner,
  TheCoin,
  TCManager,
  Minter,
  Police,
  BrokerCAD,
  BrokerTransferAssistant,
  // NOTE: The following accounts for testing only!
  client1,
  client2,
  NFTMinter,
};

export type AccountName = keyof typeof AccountId;

// Better names for these functions would be isLocal/isRemote
export const isRemote = (signer: Signer): signer is Signer => !isLocal(signer);
export const isLocal = (signer: Signer): signer is Wallet => (signer as Wallet).address != null;
