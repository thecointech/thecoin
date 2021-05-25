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
