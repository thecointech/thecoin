//
// All public-facing types are defined here.
//
// TODO: convert to DateTime / Decimal for appropriate entries

import type { DateTime } from "luxon";
import type { Decimal } from "decimal.js-light"
import { NormalizeAddress } from '@thecointech/utilities';

export type Transaction = {
  txHash: string;
  // The date this tx officially happened
  date: DateTime;
  // The date the tx was processed on the blockchain
  completed?: DateTime;
  balance: number;
  from: string;
  to: string;
  value: Decimal;
  // TODO: Merge tx fee into this structures
  fee?: Decimal;

  // To Remove
  change: number;
  counterPartyAddress: string;
}

const systemAddresses = [
  "0x0000000000000000000000000000000000000000",
  NormalizeAddress(process.env.WALLET_BrokerTransferAssistant_ADDRESS!),
  NormalizeAddress(process.env.WALLET_BrokerCAD_ADDRESS!),
  NormalizeAddress(process.env.WALLET_TheCoin_ADDRESS!),
  NormalizeAddress(process.env.WALLET_Minter_ADDRESS!),
];
export const isInternalAddress = (address: string) => systemAddresses.includes(NormalizeAddress(address));
