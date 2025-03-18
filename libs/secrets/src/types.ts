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

  MailjetApiKey = "MailjetApiKey",
  MailjetApiSecret = "MailjetApiSecret",

  PinataApiKey = "PinataApiKey",
  PinataApiSecret = "PinataApiSecret",
}
export type SecretKeyType = keyof typeof SecretKey;