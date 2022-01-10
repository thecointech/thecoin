import { NormalizeAddress } from "@thecointech/utilities";

export const skipAccounts = [
  "0x0000000000000000000000000000000000000000",
  NormalizeAddress(process.env.WALLET_BrokerTransferAssistant_ADDRESS!),
  NormalizeAddress(process.env.WALLET_BrokerCAD_ADDRESS!),
  NormalizeAddress(process.env.WALLET_TheCoin_ADDRESS!),
  NormalizeAddress(process.env.WALLET_Minter_ADDRESS!),
];
