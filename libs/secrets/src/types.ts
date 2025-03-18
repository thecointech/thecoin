export type ConfigType = "prod"|"prodtest"

export enum SecretKey {
  VqaApiKey = "VqaApiKey",
  RatesServiceAccount = "RatesServiceAccount",
  BrokerServiceAccount = "BrokerServiceAccount",
  UserDataInstructionKeyPrivate = "UserDataInstructionKeyPrivate",
  VqaSslCertPublic = "VqaSslCertPublic",
  VqaSslCertPrivate = "VqaSslCertPrivate",
  TxGmailClient = "TxGmailClient",
  FirebaseConfig = "FirebaseConfig",
  PolygonscanApiKey = "PolygonscanApiKey",
  EtherscanApiKey = "EtherscanApiKey",
  FinhubApiKey = "FinhubApiKey",
  TradierApiKey = "TradierApiKey",
}
export type SecretKeyType = keyof typeof SecretKey;