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

  InfuraProjectId = "InfuraProjectId",

  CeramicSeed = "CeramicSeed",

  GithubPackageToken = "GithubPackageToken",

  BlockpassApiKey = "BlockpassApiKey",
  BlockpassWebhookSecret = "BlockpassWebhookSecret",
  GCloudImageStorageBucket = "GCloudImageStorageBucket",

  RbcApiCredentials = "RbcApiCredentials",

  SignerOwnerPwd = "SignerOwnerPwd",
  SignerTheCoinPwd = "SignerTheCoinPwd",
  SignerTCManagerPwd = "SignerTCManagerPwd",
  SignerMinterPwd = "SignerMinterPwd",
  SignerNFTMinterPwd = "SignerNFTMinterPwd",
  SignerPolicePwd = "SignerPolicePwd",
  SignerBrokerCADPwd = "SignerBrokerCADPwd",
  SignerBrokerTransferAssistantPwd = "SignerBrokerTransferAssistantPwd",
  SignerOracleUpdaterPwd = "SignerOracleUpdaterPwd",
  SignerOracleOwnerPwd = "SignerOracleOwnerPwd",
  SignerCeramicValidatorPwd = "SignerCeramicValidatorPwd",
  // The following are for testing ownly
  SignerClient1Pwd = "SignerClient1Pwd",
  SignerClient2Pwd = "SignerClient2Pwd",
  SignerUberTesterPwd = "SignerUberTesterPwd",
  SignerSaTesterPwd = "SignerSaTesterPwd",
  SignerTestDemoAccountPwd = "SignerTestDemoAccountPwd",
}
export type SecretKeyType = keyof typeof SecretKey;