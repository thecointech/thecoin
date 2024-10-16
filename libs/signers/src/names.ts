import { Wallet } from 'ethers';
import type { Signer } from 'ethers';

export enum AccountId {
  Owner,
  TheCoin,
  TCManager,
  Minter,
  NFTMinter,
  Police,
  BrokerCAD,
  BrokerTransferAssistant,
  // Manage SpxCadOracle
  OracleOwner,
  OracleUpdater,
  // Locks down ceramic access
  CeramicValidator,
  // NOTE: The following accounts for testing only!
  client1,
  client2,
  uberTester,
  saTester, // ShockAbsorber Tester

  // A full testing account, published to test.thecoin.io
  // Opens Jan1 2022.  1/2 testing, 1/2 demo account
  // Includes harvester, uberConverter, and shockabsorber
  testDemoAccount,
};

export type AccountName = keyof typeof AccountId;
export type NamedAccounts = Record<AccountName, Signer>;


// Better names for these functions would be isLocal/isRemote
export const isRemote = (signer?: Signer): signer is Signer => !isLocal(signer);
export const isLocal = (signer?: Signer): signer is Wallet => !!(signer as Wallet)?.encrypt || (signer && !signer.getAddress);
