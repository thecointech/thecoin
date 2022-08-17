import { Wallet } from '@ethersproject/wallet';
import type { Signer } from '@ethersproject/abstract-signer';

export enum AccountId {
  Owner,
  TheCoin,
  TCManager,
  Minter,
  NFTMinter,
  Police,
  BrokerCAD,
  BrokerTransferAssistant,
  // NOTE: The following accounts for testing only!
  client1,
  client2,
};

export type AccountName = keyof typeof AccountId;
export type NamedAccounts = Record<AccountName, Signer>;


// Better names for these functions would be isLocal/isRemote
export const isRemote = (signer?: Signer): signer is Signer => !isLocal(signer);
export const isLocal = (signer?: Signer): signer is Wallet => !!(signer as Wallet)?.address;
