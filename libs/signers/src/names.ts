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

export const isSigner = (signer: Signer): signer is Signer => !isWallet(signer);
export const isWallet = (signer: Signer): signer is Wallet => (signer as Wallet)._mnemonic != null;
