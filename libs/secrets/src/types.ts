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

  PinataApiKey = "PinataApiKey",
  PinataApiSecret = "PinataApiSecret",

  CeramicSeed = "CeramicSeed",

  GithubPackageToken = "GithubPackageToken",

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

export enum SecretKeyGoogle {
  // Used by broker
  BrokerGDriveClientId = 'BrokerGDriveClientId',
  BrokerGDriveClientSecret = 'BrokerGDriveClientSecret',

  BlockpassApiKey = "BlockpassApiKey",
  BlockpassWebhookSecret = "BlockpassWebhookSecret",
  GCloudImageStorageBucket = "GCloudImageStorageBucket",

  WALLET_BrokerTransferAssistant_KEY = "WALLET_BrokerTransferAssistant_KEY",

  // Used by rates
  WALLET_OracleUpdater_KEY = "WALLET_OracleUpdater_KEY",

  FinhubApiKey = "FinhubApiKey",
  TradierApiKey = "TradierApiKey",

  // Used by both
  MailjetApiKey = "MailjetApiKey",
  MailjetApiSecret = "MailjetApiSecret",
  InfuraProjectId = "InfuraProjectId",
}

export type SecretKeyType = keyof typeof SecretKey | keyof typeof SecretKeyGoogle;